package com.gpt.modulos.congregacao.service;

import com.gpt.modulos.congregacao.dto.CongregacaoRequestDTO;
import com.gpt.modulos.congregacao.dto.CongregacaoResponseDTO;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CongregacaoService {

    private final CongregacaoRepository congregacaoRepository;

    @Transactional(readOnly = true)
    public List<CongregacaoResponseDTO> listarTodas() {
        return congregacaoRepository.findAll().stream()
                .map(this::converterParaResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CongregacaoResponseDTO buscarPorId(Long id) {
        Congregacao congregacao = congregacaoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Congregação não encontrada com o ID: " + id));
        return converterParaResponseDTO(congregacao);
    }

    @Transactional
    public CongregacaoResponseDTO criar(CongregacaoRequestDTO request) {
        Congregacao congregacao = Congregacao.builder()
                .nome(request.getNome())
                .cidade(request.getCidade())
                .estado(request.getEstado().toUpperCase())
                .build();

        Congregacao salva = congregacaoRepository.save(congregacao);
        return converterParaResponseDTO(salva);
    }

    private CongregacaoResponseDTO converterParaResponseDTO(Congregacao congregacao) {
        return CongregacaoResponseDTO.builder()
                .id(congregacao.getId())
                .nome(congregacao.getNome())
                .cidade(congregacao.getCidade())
                .estado(congregacao.getEstado())
                .criadoEm(congregacao.getCriadoEm())
                .build();
    }
}