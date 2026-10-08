package com.gpt.modulos.publicador.service;

import com.gpt.config.security.SecurityUtils;
import com.gpt.exceptions.BusinessException;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.pedido.repository.PedidoPublicadorRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.model.SituacaoPessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicador.dto.PublicadorRequestDTO;
import com.gpt.modulos.publicador.dto.PublicadorResponseDTO;
import com.gpt.modulos.publicador.model.EventoHistoricoPublicador;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.territorio.repository.HistoricoTerritorioRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import com.gpt.shared.dto.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicadorService {

    private final PublicadorRepository publicadorRepository;
    private final CongregacaoRepository congregacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistoricoTerritorioRepository historicoTerritorioRepository;
    private final MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;
    private final PedidoPublicadorRepository pedidoPublicadorRepository;
    private final HistoricoPublicadorService historicoPublicadorService;
    private final SecurityUtils securityUtils;

    @Transactional
    public PublicadorResponseDTO criar(PublicadorRequestDTO request) {

        Long congregacaoId = getCongregacaoIdObrigatoria(
                request.getCongregacaoId()
        );

        Congregacao congregacao = congregacaoRepository.findById(congregacaoId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Congregação não encontrada com ID: " + congregacaoId
                ));

        Pessoa pessoa = Pessoa.builder()
                .nome(request.getNome().trim())
                .dataNascimento(request.getDataNascimento())
                .telefone(request.getTelefone())
                .email(request.getEmail())
                .build();

        pessoa = pessoaRepository.save(pessoa);

        Publicador publicador = Publicador.builder()
                .pessoa(pessoa)
                .ativo(true)
                .congregacao(congregacao)
                .build();

        publicador = publicadorRepository.save(publicador);

        historicoPublicadorService.registrar(
                publicador,
                EventoHistoricoPublicador.CRIADO
        );

        return toDTO(publicador);
    }

    @Transactional(readOnly = true)
    public PageResponse<PublicadorResponseDTO> listarPorCongregacao(
            Long congregacaoId,
            Pageable pageable
    ) {

        Long congregacaoIdValidado =
                getCongregacaoIdObrigatoria(congregacaoId);

        Page<Publicador> pagina =
                publicadorRepository
                        .findByCongregacaoIdAndAtivoTrueOrderByPessoa_NomeAsc(
                                congregacaoIdValidado,
                                pageable
                        );

        return PageResponse.from(
                pagina.map(this::toDTO)
        );
    }

    @Transactional
    public PublicadorResponseDTO atualizar(
            Long id,
            PublicadorRequestDTO request
    ) {

        Publicador publicador = buscarEValidarAcesso(id);
        
        Pessoa pessoa = publicador.getPessoa();

        pessoa.setNome(request.getNome().trim());
        pessoa.setDataNascimento(request.getDataNascimento());
        pessoa.setTelefone(request.getTelefone());
        pessoa.setEmail(request.getEmail());

        pessoaRepository.save(pessoa);

        return toDTO(publicador);
    }
    
    @Transactional
    public void transferir(
            Long id,
            Long congregacaoDestinoId
    ) {

        Publicador publicador = buscarEValidarAcesso(id);

        Long congregacaoOrigemId =
                publicador.getCongregacao().getId();

        if (congregacaoOrigemId.equals(congregacaoDestinoId)) {
            throw new BusinessException(
                    "O publicador já pertence à congregação informada."
            );
        }

        Congregacao congregacaoOrigem =
                publicador.getCongregacao();
        
        Congregacao congregacaoDestino =
                congregacaoRepository.findById(congregacaoDestinoId)
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Congregação de destino não encontrada com ID: "
                                        + congregacaoDestinoId
                        ));

        Usuario usuarioResponsavel =
                securityUtils.getUsuarioLogado()
                        .orElseThrow(() -> new AccessDeniedException(
                                "Usuário autenticado não encontrado."
                        ));

        publicador.setCongregacao(congregacaoDestino);

        publicadorRepository.save(publicador);

        historicoPublicadorService.registrar(
                publicador,
                EventoHistoricoPublicador.TRANSFERIDO,
                "Transferido para a congregação "
                        + congregacaoDestino.getNome(),
                usuarioResponsavel,
                congregacaoOrigem
        );
        
        historicoPublicadorService.registrar(
                publicador,
                EventoHistoricoPublicador.TRANSFERIDO,
                "Recebido da congregação "
                        + congregacaoOrigem.getNome(),
                usuarioResponsavel,
                congregacaoDestino
        );
    }

    @Transactional
    public void desativar(Long id) {

        Publicador publicador = buscarEValidarAcesso(id);

        publicador.setAtivo(false);

        Pessoa pessoa = publicador.getPessoa();
        pessoa.setSituacao(SituacaoPessoa.INATIVO);

        pessoaRepository.save(pessoa);
        publicadorRepository.save(publicador);

        historicoPublicadorService.registrar(
                publicador,
                EventoHistoricoPublicador.INATIVADO
        );
    }

    @Transactional
    public void reativar(Long id) {

        Publicador publicador = buscarEValidarAcesso(id);

        publicador.setAtivo(true);

        Pessoa pessoa = publicador.getPessoa();
        pessoa.setSituacao(SituacaoPessoa.ATIVO);

        pessoaRepository.save(pessoa);
        publicadorRepository.save(publicador);

        historicoPublicadorService.registrar(
                publicador,
                EventoHistoricoPublicador.REATIVADO
        );
    }

    @Transactional
    public void excluirDefinitivamente(Long id) {

        Publicador publicador = buscarEValidarAcesso(id);

        Pessoa pessoa = publicador.getPessoa();

        if (usuarioRepository.existsByPessoaId(pessoa.getId())) {
            throw new BusinessException(
                    "Não é possível excluir definitivamente este publicador, " +
                    "pois ele possui um usuário vinculado ao sistema."
            );
        }

        if (historicoTerritorioRepository.existsByPublicadorId(id)) {
            throw new BusinessException(
                    "Não é possível excluir definitivamente este publicador, " +
                    "pois existem registros de histórico de territórios vinculados a ele."
            );
        }

        if (movimentacaoEstoqueRepository.existsByPublicadorId(id)) {
            throw new BusinessException(
                    "Não é possível excluir definitivamente este publicador, " +
                    "pois existem movimentações de estoque vinculadas a ele."
            );
        }

        if (pedidoPublicadorRepository.existsByPublicadorId(id)) {
            throw new BusinessException(
                    "Não é possível excluir definitivamente este publicador, " +
                    "pois existem pedidos vinculados a ele."
            );
        }

        historicoPublicadorService.registrar(
                publicador,
                EventoHistoricoPublicador.EXCLUIDO_DEFINITIVAMENTE
        );

        publicadorRepository.delete(publicador);
        pessoaRepository.delete(pessoa);
    }

    @Transactional(readOnly = true)
    public List<PublicadorResponseDTO> listarDisponiveisParaUsuario(
            Long congregacaoId
    ) {

        Long congregacaoIdValidado =
                getCongregacaoIdObrigatoria(congregacaoId);

        return publicadorRepository
                .findDisponiveisParaUsuario(congregacaoIdValidado)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private Publicador buscarEValidarAcesso(Long publicadorId) {

        Publicador publicador = publicadorRepository.findById(publicadorId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Publicador não encontrado com ID: " + publicadorId
                ));

        getCongregacaoIdObrigatoria(
                publicador.getCongregacao().getId()
        );

        return publicador;
    }

    private Long getCongregacaoIdObrigatoria(
            Long congregacaoIdSolicitada
    ) {

        if (congregacaoIdSolicitada == null) {
            throw new IllegalArgumentException(
                    "A congregação é obrigatória."
            );
        }

        if (securityUtils.isAdminGeral()) {
            return congregacaoIdSolicitada;
        }

        Long congregacaoIdLogada =
                securityUtils.getCongregacaoIdLogada();

        if (congregacaoIdLogada == null) {
            throw new AccessDeniedException(
                    "Usuário autenticado não possui uma congregação vinculada."
            );
        }

        if (!congregacaoIdLogada.equals(congregacaoIdSolicitada)) {
            throw new AccessDeniedException(
                    "Você não tem permissão para acessar outra congregação."
            );
        }

        return congregacaoIdLogada;
    }

    private PublicadorResponseDTO toDTO(Publicador publicador) {

        return PublicadorResponseDTO.builder()
                .id(publicador.getId())
                .nome(publicador.getPessoa().getNome())
                .dataNascimento(publicador.getPessoa().getDataNascimento())
                .telefone(publicador.getPessoa().getTelefone())
                .email(publicador.getPessoa().getEmail())
                .ativo(publicador.getAtivo())
                .congregacaoId(publicador.getCongregacao().getId())
                .build();
    }
}
