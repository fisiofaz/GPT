package com.gpt.modulos.publicador.controller;

import com.gpt.modulos.publicador.dto.PublicadorRequestDTO;
import com.gpt.modulos.publicador.dto.PublicadorResponseDTO;
import com.gpt.modulos.publicador.service.PublicadorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/publicadores")
@RequiredArgsConstructor
public class PublicadorController {

    private final PublicadorService publicadorService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<PublicadorResponseDTO> criar(@Valid @RequestBody PublicadorRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicadorService.criar(request));
    }

    @GetMapping("/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<List<PublicadorResponseDTO>> listarPorCongregacao(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicadorService.listarPorCongregacao(congregacaoId));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<PublicadorResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody PublicadorRequestDTO request) {
        return ResponseEntity.ok(publicadorService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        publicadorService.desativar(id);
        return ResponseEntity.noContent().build();
    }
}