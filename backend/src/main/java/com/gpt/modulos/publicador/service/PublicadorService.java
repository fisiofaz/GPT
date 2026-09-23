package com.gpt.modulos.publicador.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.model.SituacaoPessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicador.dto.PublicadorRequestDTO;
import com.gpt.modulos.publicador.dto.PublicadorResponseDTO;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.movimentacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.pedido.repository.PedidoPublicadorRepository;
import com.gpt.modulos.territorio.repository.HistoricoTerritorioRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import com.gpt.exceptions.BusinessException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional
    public PublicadorResponseDTO criar(PublicadorRequestDTO request) {
    	
        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException(
                		"Congregação não encontrada com ID: " + request.getCongregacaoId()));

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
        return toDTO(publicador);
    }

    @Transactional(readOnly = true)
    public List<PublicadorResponseDTO> listarPorCongregacao(Long congregacaoId) {
        
    	return publicadorRepository
    			.findByCongregacaoIdAndAtivoTrueOrderByPessoa_NomeAsc(congregacaoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
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
    
    @Transactional
    public PublicadorResponseDTO atualizar(Long id, PublicadorRequestDTO request) {
    	
        Publicador publicador = publicadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                		"Publicador não encontrado com ID: " + id));

        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException(
                		"Congregação não encontrada com ID: " + request.getCongregacaoId()));

        Pessoa pessoa = publicador.getPessoa();
        
        pessoa.setNome(request.getNome().trim());
        pessoa.setDataNascimento(request.getDataNascimento());
        pessoa.setTelefone(request.getTelefone());
        pessoa.setEmail(request.getEmail());

        publicador.setCongregacao(congregacao);
        
        pessoaRepository.save(pessoa);
        publicadorRepository.save(publicador);
        
        return toDTO(publicador);
    }

    @Transactional
    public void desativar(Long id) {
    	
        Publicador publicador = publicadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                		"Publicador não encontrado com ID: " + id));
        
        publicador.setAtivo(false);
        
        Pessoa pessoa = publicador.getPessoa();
        pessoa.setSituacao(SituacaoPessoa.INATIVO);

        pessoaRepository.save(pessoa);
        publicadorRepository.save(publicador);
    }
    
    @Transactional
    public void reativar(Long id) {

        Publicador publicador = publicadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Publicador não encontrado com ID: " + id));

        publicador.setAtivo(true);

        Pessoa pessoa = publicador.getPessoa();
        pessoa.setSituacao(SituacaoPessoa.ATIVO);

        pessoaRepository.save(pessoa);
        publicadorRepository.save(publicador);
    }
    
    @Transactional
    public void excluirDefinitivamente(Long id) {

        Publicador publicador = publicadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Publicador não encontrado com ID: " + id));

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

        publicadorRepository.delete(publicador);
        pessoaRepository.delete(pessoa);
    }
}