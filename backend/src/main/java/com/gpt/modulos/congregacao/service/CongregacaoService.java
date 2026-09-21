package com.gpt.modulos.congregacao.service;

import com.gpt.modulos.congregacao.dto.CongregacaoRequestDTO;
import com.gpt.modulos.congregacao.dto.CongregacaoResponseDTO;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import jakarta.persistence.EntityNotFoundException;
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
                .orElseThrow(() -> new EntityNotFoundException(
                        "Congregação não encontrada com o ID: " + id
                ));

        return converterParaResponseDTO(congregacao);
    }
    
    @Transactional
    public CongregacaoResponseDTO criar(CongregacaoRequestDTO request) {
        Congregacao congregacao = Congregacao.builder()
                .nome(request.getNome())
                .numero(request.getNumero())
                .numeroCircuito(request.getNumeroCircuito())
                .cidade(request.getCidade())
                .estado(request.getEstado().toUpperCase())
                .build();

        Congregacao salva = congregacaoRepository.save(congregacao);
        return converterParaResponseDTO(salva);
    }

    @Transactional
    public CongregacaoResponseDTO atualizar(Long id, CongregacaoRequestDTO request) {
        Congregacao congregacao = congregacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada com o ID: " + id));

        congregacao.setNome(request.getNome());
        congregacao.setNumero(request.getNumero());
        congregacao.setNumeroCircuito(request.getNumeroCircuito());
        congregacao.setCidade(request.getCidade());
        congregacao.setEstado(request.getEstado().toUpperCase());

        Congregacao atualizada = congregacaoRepository.save(congregacao);
        
        // Reaproveita o método auxiliar padronizado do serviço
        return converterParaResponseDTO(atualizada);
    }

    @Transactional
    public void deletar(Long id) {
        if (!congregacaoRepository.existsById(id)) {
            throw new EntityNotFoundException("Congregação não encontrada com o ID: " + id);
        }
        congregacaoRepository.deleteById(id);
    }

    private CongregacaoResponseDTO converterParaResponseDTO(Congregacao congregacao) {
        return CongregacaoResponseDTO.builder()
                .id(congregacao.getId())
                .nome(congregacao.getNome())
                .numero(congregacao.getNumero())
                .numeroCircuito(congregacao.getNumeroCircuito())
                .atualizadoEm(congregacao.getAtualizadoEm())
                .cidade(congregacao.getCidade())
                .estado(congregacao.getEstado())
                .criadoEm(congregacao.getCriadoEm())
                .build();
    }
}