package com.gpt.modulos.publicador.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
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
    private final PessoaRepository pessoaRepository;

    @Transactional
    public PublicadorResponseDTO criar(PublicadorRequestDTO request) {
    	
        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException(
                		"Congregação não encontrada com ID: " + request.getCongregacaoId()));

        Pessoa pessoa = Pessoa.builder()
                .nome(request.getNome().trim())
                .telefone(request.getTelefone())
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
                .telefone(publicador.getPessoa().getTelefone())
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
        pessoa.setTelefone(request.getTelefone());

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
        publicadorRepository.save(publicador);
    }
}