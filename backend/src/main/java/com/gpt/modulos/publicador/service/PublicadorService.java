package com.gpt.modulos.publicador.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.publicador.dto.PublicadorRequestDTO;
import com.gpt.modulos.publicador.dto.PublicadorResponseDTO;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
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

    @Transactional
    public PublicadorResponseDTO criar(PublicadorRequestDTO request) {
        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada com ID: " + request.getCongregacaoId()));

        Publicador publicador = Publicador.builder()
                .nome(request.getNome().trim())
                .telefone(request.getTelefone())
                .ativo(true)
                .congregacao(congregacao)
                .build();

        publicador = publicadorRepository.save(publicador);
        return toDTO(publicador);
    }

    @Transactional(readOnly = true)
    public List<PublicadorResponseDTO> listarPorCongregacao(Long congregacaoId) {
        return publicadorRepository.findByCongregacaoIdAndAtivoTrueOrderByNomeAsc(congregacaoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private PublicadorResponseDTO toDTO(Publicador p) {
        return PublicadorResponseDTO.builder()
                .id(p.getId())
                .nome(p.getNome())
                .telefone(p.getTelefone())
                .ativo(p.getAtivo())
                .congregacaoId(p.getCongregacao().getId())
                .build();
    }
    
    @Transactional
    public PublicadorResponseDTO atualizar(Long id, PublicadorRequestDTO request) {
        Publicador publicador = publicadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicador não encontrado com ID: " + id));

        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada com ID: " + request.getCongregacaoId()));

        publicador.setNome(request.getNome().trim());
        publicador.setTelefone(request.getTelefone());
        publicador.setCongregacao(congregacao);

        publicador = publicadorRepository.save(publicador);
        return toDTO(publicador);
    }

    @Transactional
    public void desativar(Long id) {
        Publicador publicador = publicadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publicador não encontrado com ID: " + id));
        publicador.setAtivo(false);
        publicadorRepository.save(publicador);
    }
}