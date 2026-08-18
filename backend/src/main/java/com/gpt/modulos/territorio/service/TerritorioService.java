package com.gpt.modulos.territorio.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.territorio.dto.HistoricoTerritorioResponseDTO;
import com.gpt.modulos.territorio.dto.MovimentacaoTerritorioDTO;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.territorio.model.HistoricoTerritorio;
import com.gpt.modulos.territorio.model.StatusTerritorio;
import com.gpt.modulos.territorio.model.Territorio;
import com.gpt.modulos.territorio.repository.HistoricoTerritorioRepository;
import com.gpt.modulos.territorio.repository.TerritorioRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public TerritorioResponseDTO criar(TerritorioRequestDTO request) {
        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Congregação não encontrada"));

        if (territorioRepository.existsByNumeroAndCongregacaoId(request.getNumero(), request.getCongregacaoId())) {
            throw new IllegalArgumentException("Já existe um território com o número " + request.getNumero() + " nesta congregação");
        }

        Territorio territorio = Territorio.builder()
                .numero(request.getNumero())
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .status(StatusTerritorio.DISPONIVEL)
                .congregacao(congregacao)
                .build();

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
                .orElseThrow(() -> new IllegalArgumentException("Território não encontrado"));

        if (territorio.getStatus() != StatusTerritorio.DISPONIVEL) {
            throw new IllegalStateException("O território não está disponível para retirada");
        }

        Usuario publicador = usuarioRepository.findById(request.getPublicadorId())
                .orElseThrow(() -> new IllegalArgumentException("Publicador não encontrado"));

        territorio.setStatus(StatusTerritorio.EM_TRABALHO);
        territorioRepository.save(territorio);

        HistoricoTerritorio historico = HistoricoTerritorio.builder()
                .territorio(territorio)
                .publicador(publicador)
                .observacoes(request.getObservacoes())
                .build();

        return converterParaHistoricoDTO(historicoRepository.save(historico));
    }

    @Transactional
    public HistoricoTerritorioResponseDTO devolverTerritorio(Long territorioId, String observacoes) {
        Territorio territorio = territorioRepository.findById(territorioId)
                .orElseThrow(() -> new IllegalArgumentException("Território não encontrado"));

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

    private TerritorioResponseDTO converterParaResponseDTO(Territorio territorio) {
        return TerritorioResponseDTO.builder()
                .id(territorio.getId())
                .numero(territorio.getNumero())
                .nome(territorio.getNome())
                .descricao(territorio.getDescricao())
                .status(territorio.getStatus())
                .congregacaoId(territorio.getCongregacao().getId())
                .congregacaoNome(territorio.getCongregacao().getNome())
                .criadoEm(territorio.getCriadoEm())
                .build();
    }

    private HistoricoTerritorioResponseDTO converterParaHistoricoDTO(HistoricoTerritorio h) {
        return HistoricoTerritorioResponseDTO.builder()
                .id(h.getId())
                .territorioId(h.getTerritorio().getId())
                .territorioNumero(h.getTerritorio().getNumero())
                .publicadorId(h.getPublicador().getId())
                .publicadorNome(h.getPublicador().getNome())
                .dataRetirada(h.getDataRetirada())
                .dataDevolucao(h.getDataDevolucao())
                .observacoes(h.getObservacoes())
                .build();
    }
}