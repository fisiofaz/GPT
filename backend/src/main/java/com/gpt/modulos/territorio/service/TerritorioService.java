package com.gpt.modulos.territorio.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.territorio.dto.HistoricoTerritorioResponseDTO;
import com.gpt.modulos.territorio.dto.MovimentacaoTerritorioDTO;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.territorio.model.HistoricoTerritorio;
import com.gpt.modulos.territorio.model.StatusTerritorio;
import com.gpt.modulos.territorio.model.Territorio;
import com.gpt.modulos.territorio.repository.HistoricoTerritorioRepository;
import com.gpt.modulos.territorio.repository.TerritorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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

    @Transactional
    public TerritorioResponseDTO criar(TerritorioRequestDTO request) {
        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Congregação não encontrada com ID: " + request.getCongregacaoId()));

        if (territorioRepository.existsByNumeroAndCongregacaoId(request.getNumero(), request.getCongregacaoId())) {
            throw new IllegalArgumentException("Já existe um território com o número " + request.getNumero() + " nesta congregação");
        }

        Territorio territorio = Territorio.builder()
                .numero(request.getNumero())
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .poligonoGeojson(request.getPoligonoGeojson())
                .status(StatusTerritorio.DISPONIVEL)
                .congregacao(congregacao)
                .build();

        return converterParaResponseDTO(territorioRepository.save(territorio));
    }
    
    @Transactional
    public TerritorioResponseDTO atualizarPoligono(Long territorioId, String poligonoGeojson) {
        Territorio territorio = territorioRepository.findById(territorioId)
                .orElseThrow(() -> new IllegalArgumentException("Território não encontrado com ID: " + territorioId));

        territorio.setPoligonoGeojson(poligonoGeojson);
        return converterParaResponseDTO(territorioRepository.save(territorio));
    }

    @Transactional(readOnly = true)
    public List<TerritorioResponseDTO> listarPorCongregacao(Long congregacaoId) {
        return territorioRepository.findByCongregacaoId(congregacaoId).stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HistoricoTerritorioResponseDTO retirarTerritorio(Long territorioId, MovimentacaoTerritorioDTO request) {
        Territorio territorio = territorioRepository.findById(territorioId)
                .orElseThrow(() -> new IllegalArgumentException("Território não encontrado com ID: " + territorioId));

        if (territorio.getStatus() != StatusTerritorio.DISPONIVEL) {
            throw new IllegalStateException("O território não está disponível para retirada");
        }

        Publicador publicador = publicadorRepository.findById(request.getPublicadorId())
                .orElseThrow(() -> new IllegalArgumentException("Publicador não encontrado com ID: " + request.getPublicadorId()));

        territorio.setStatus(StatusTerritorio.EM_TRABALHO);
        territorioRepository.save(territorio);

        HistoricoTerritorio historico = HistoricoTerritorio.builder()
                .territorio(territorio)
                .publicador(publicador)
                .dataRetirada(LocalDateTime.now())
                .observacoes(request.getObservacoes())
                .build();

        return converterParaHistoricoDTO(historicoRepository.save(historico));
    }

    @Transactional
    public HistoricoTerritorioResponseDTO devolverTerritorio(Long territorioId, String observacoes) {
        Territorio territorio = territorioRepository.findById(territorioId)
                .orElseThrow(() -> new IllegalArgumentException("Território não encontrado com ID: " + territorioId));

        HistoricoTerritorio historico = historicoRepository.findByTerritorioIdAndDataDevolucaoIsNull(territorioId)
                .orElseThrow(() -> new IllegalStateException("Não há registro de retirada pendente de devolução para este território"));

        historico.setDataDevolucao(LocalDateTime.now());
        if (observacoes != null && !observacoes.isBlank()) {
            historico.setObservacoes(historico.getObservacoes() != null 
                    ? historico.getObservacoes() + " | Devolução: " + observacoes 
                    : "Devolução: " + observacoes);
        }

        territorio.setStatus(StatusTerritorio.DISPONIVEL);
        territorioRepository.save(territorio);

        return converterParaHistoricoDTO(historicoRepository.save(historico));
    }

    @Transactional(readOnly = true)
    public List<HistoricoTerritorioResponseDTO> listarHistorico(Long territorioId) {
        return historicoRepository.findByTerritorioIdOrderByDataRetiradaDesc(territorioId).stream()
                .map(this::converterParaHistoricoDTO)
                .collect(Collectors.toList());
    }
    
    public TerritorioResponseDTO buscarPorId(Long id) {
        Territorio territorio = territorioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Território não encontrado com ID: " + id));
        return converterParaResponseDTO(territorio);
    }

    @Transactional(readOnly = true)
    public List<HistoricoTerritorioResponseDTO> listarHistoricoGeral(Long congregacaoId) {
        return historicoRepository.buscarHistoricoGeralPorCongregacao(congregacaoId).stream()
                .map(this::converterParaHistoricoDTO)
                .collect(Collectors.toList());
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
            nomePublicador = h.getPublicador().getNome() != null ? h.getPublicador().getNome() : "Sem nome";
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