package com.gpt.modulos.territorio.service;

import com.gpt.config.security.SecurityUtils;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.territorio.dto.HistoricoTerritorioResponseDTO;
import com.gpt.modulos.territorio.dto.MovimentacaoTerritorioDTO;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.territorio.enums.StatusTerritorio;
import com.gpt.modulos.territorio.model.HistoricoTerritorio;
import com.gpt.modulos.territorio.model.Territorio;
import com.gpt.modulos.territorio.repository.HistoricoTerritorioRepository;
import com.gpt.modulos.territorio.repository.TerritorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TerritorioService {

    private final TerritorioRepository territorioRepository;
    private final HistoricoTerritorioRepository historicoRepository;
    private final CongregacaoRepository congregacaoRepository;
    private final PublicadorRepository publicadorRepository;
    private final SecurityUtils securityUtils;
    
    private boolean isAdminGeral() {
        return securityUtils.getUsuarioLogado()
                .map(usuario -> usuario.getRoles().stream()
                        .anyMatch(role -> "ROLE_ADMIN_GERAL".equals(role.getNome())))
                .orElse(false);
    }

    private Long getCongregacaoIdObrigatoria(Long congregacaoIdSolicitada) {
        if (isAdminGeral()) {
            return congregacaoIdSolicitada;
        }

        Long congregacaoIdLogada = securityUtils.getCongregacaoIdLogada();

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

    @Transactional
    public TerritorioResponseDTO criar(TerritorioRequestDTO request) {

    	Long congregacaoId = getCongregacaoIdObrigatoria(request.getCongregacaoId());
    	
        Congregacao congregacao = congregacaoRepository.findById(congregacaoId)
                .orElseThrow(() -> new IllegalArgumentException(
                		"Congregação não encontrada com ID: " + congregacaoId
                ));

        if (territorioRepository.existsByNumeroAndCongregacaoId(
        		request.getNumero(), congregacaoId)) {

            throw new IllegalArgumentException(
            		"Já existe um território com o número "
            				+ request.getNumero()
            				+ " nesta congregação"
            );
        }

        Territorio territorio = Territorio.builder()
                .numero(request.getNumero())
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .poligonoGeojson(request.getPoligonoGeojson())
                .status(StatusTerritorio.DISPONIVEL)
                .congregacao(congregacao)
                .build();

        return converterParaResponseDTO(
        		territorioRepository.save(territorio)
        );
    }
    
    @Transactional
    public TerritorioResponseDTO atualizarPoligono(Long territorioId, String poligonoGeojson) {
    	
    	Territorio territorio =
                buscarTerritorioComAcessoPermitido(territorioId);
    	
        territorio.setPoligonoGeojson(poligonoGeojson);

        return converterParaResponseDTO(
        		territorioRepository.save(territorio)
       );
    }

    @Transactional(readOnly = true)
    public List<TerritorioResponseDTO> listarPorCongregacao(Long congregacaoId) {

    	Long congregacaoIdPermitida =
                getCongregacaoIdObrigatoria(congregacaoId);
    	
        return territorioRepository
        		.findByCongregacaoId(congregacaoIdPermitida)
        		.stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HistoricoTerritorioResponseDTO retirarTerritorio(Long territorioId, MovimentacaoTerritorioDTO request) {
    	
    	Territorio territorio =
    	            buscarTerritorioComAcessoPermitido(territorioId);

        if (territorio.getStatus() != StatusTerritorio.DISPONIVEL) {
            throw new IllegalStateException(
            		"O território não está disponível para retirada"
            );
        }

        Publicador publicador = publicadorRepository.findById(
        		request.getPublicadorId()
        ).orElseThrow(() -> new IllegalArgumentException(
        		"Publicador não encontrado com ID: "
        				+ request.getPublicadorId()
        ));
        
        Long congregacaoTerritorioId =
                territorio.getCongregacao().getId();

        Long congregacaoPublicadorId =
                publicador.getCongregacao() != null
                        ? publicador.getCongregacao().getId()
                        : null;

        if (congregacaoPublicadorId == null
                || !congregacaoTerritorioId.equals(congregacaoPublicadorId)) {

            throw new AccessDeniedException(
                    "O publicador não pertence à mesma congregação do território."
            );
        }

        territorio.setStatus(StatusTerritorio.EM_TRABALHO);
        territorioRepository.save(territorio);

        HistoricoTerritorio historico = HistoricoTerritorio.builder()
                .territorio(territorio)
                .publicador(publicador)
                .dataRetirada(LocalDateTime.now())
                .observacoes(request.getObservacoes())
                .build();

        return converterParaHistoricoDTO(
        		historicoRepository.save(historico)
        );
    }

    @Transactional
    public HistoricoTerritorioResponseDTO devolverTerritorio(Long territorioId, String observacoes) {
    	
    	Territorio territorio =
                buscarTerritorioComAcessoPermitido(territorioId);

        HistoricoTerritorio historico = 
        		historicoRepository
        			.findByTerritorioIdAndDataDevolucaoIsNull(territorioId)
        			.orElseThrow(() -> new IllegalStateException(
        					"Não há registro de retirada pendente de devolução para este território"
        			));

        historico.setDataDevolucao(LocalDateTime.now());
        
        if (observacoes != null && !observacoes.isBlank()) {
            historico.setObservacoes(
            		historico.getObservacoes() != null 
                    	? historico.getObservacoes()
                    			+ " | Devolução: " + observacoes 
                    	: "Devolução: " + observacoes
            );
        }

        territorio.setStatus(StatusTerritorio.DISPONIVEL);
        territorioRepository.save(territorio);

        return converterParaHistoricoDTO(
        		historicoRepository.save(historico)
        );
    }

    @Transactional(readOnly = true)
    public List<HistoricoTerritorioResponseDTO> listarHistorico(Long territorioId) {
    	
    	buscarTerritorioComAcessoPermitido(territorioId);
    	
        return historicoRepository
        		.findByTerritorioIdOrderByDataRetiradaDesc(territorioId)
        		.stream()
                .map(this::converterParaHistoricoDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TerritorioResponseDTO buscarPorId(Long id) {

    	Territorio territorio =
                buscarTerritorioComAcessoPermitido(id);

        return converterParaResponseDTO(territorio);
    }

    @Transactional(readOnly = true)
    public List<HistoricoTerritorioResponseDTO> listarHistoricoGeral(Long congregacaoId) {
    	
    	Long congregacaoIdPermitida =
                getCongregacaoIdObrigatoria(congregacaoId);
    	
        return historicoRepository
        		.buscarHistoricoGeralPorCongregacao(congregacaoIdPermitida)
        		.stream()
                .map(this::converterParaHistoricoDTO)
                .collect(Collectors.toList());
    }
    
    private Territorio buscarTerritorioComAcessoPermitido(Long territorioId) {

        if (isAdminGeral()) {
            return territorioRepository.findById(territorioId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Território não encontrado com ID: " + territorioId
                    ));
        }

        Long congregacaoId = securityUtils.getCongregacaoIdLogada();

        if (congregacaoId == null) {
            throw new AccessDeniedException(
                    "Usuário autenticado não possui uma congregação vinculada."
            );
        }

        return territorioRepository.findByIdAndCongregacaoId(
                        territorioId,
                        congregacaoId
                )
                .orElseThrow(() -> new AccessDeniedException(
                        "Você não tem permissão para acessar este território."
                ));
    }

    private TerritorioResponseDTO converterParaResponseDTO(Territorio territorio) {
        return TerritorioResponseDTO.builder()
                .id(territorio.getId())
                .numero(territorio.getNumero())
                .nome(territorio.getNome())
                .descricao(territorio.getDescricao())
                .poligonoGeojson(territorio.getPoligonoGeojson())
                .status(territorio.getStatus())
                .congregacaoId(territorio.getCongregacao().getId())
                .congregacaoNome(territorio.getCongregacao().getNome())
                .criadoEm(territorio.getCriadoEm())
                .build();
    }

    private HistoricoTerritorioResponseDTO converterParaHistoricoDTO(HistoricoTerritorio h) {
        String nomePublicador = "Não informado";
        Long idPublicador = null;
        
        if (h.getPublicador() != null) {
            idPublicador = h.getPublicador().getId();
            nomePublicador = h.getPublicador().getPessoa() != null
                    && h.getPublicador().getPessoa().getNome() != null
                    ? h.getPublicador().getPessoa().getNome()
                    : "Sem nome";
        }

        String numeroTerritorio = "-";
        String nomeTerritorio = "Sem nome";
        Long idTerritorio = null;

        if (h.getTerritorio() != null) {
            idTerritorio = h.getTerritorio().getId();
            numeroTerritorio = h.getTerritorio().getNumero() != null ? h.getTerritorio().getNumero() : "-";
            nomeTerritorio = h.getTerritorio().getNome() != null ? h.getTerritorio().getNome() : "Sem nome";
        }
        
        return HistoricoTerritorioResponseDTO.builder()
                .id(h.getId())
                .territorioId(h.getTerritorio() != null ? h.getTerritorio().getId() : null)
                .territorioNumero(h.getTerritorio() != null ? h.getTerritorio().getNumero() : "-")
                .territorioNome(h.getTerritorio() != null ? h.getTerritorio().getNome() : "Sem nome")
                .publicadorId(idPublicador)
                .publicadorNome(nomePublicador)
                .dataRetirada(h.getDataRetirada())
                .dataDevolucao(h.getDataDevolucao())
                .observacoes(h.getObservacoes())
                .build();
    }
}