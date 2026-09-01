package com.gpt.modulos.congregacao.controller;

import com.gpt.modulos.congregacao.dto.CongregacaoRequestDTO;
import com.gpt.modulos.congregacao.dto.CongregacaoResponseDTO;
import com.gpt.modulos.congregacao.service.CongregacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/congregacoes")
@RequiredArgsConstructor
public class CongregacaoController {

    private final CongregacaoService congregacaoService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL')")
    public ResponseEntity<List<CongregacaoResponseDTO>> listarTodas() {
        return ResponseEntity.ok(congregacaoService.listarTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<CongregacaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(congregacaoService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN_GERAL')")
    public ResponseEntity<CongregacaoResponseDTO> criar(@Valid @RequestBody CongregacaoRequestDTO request) {
        CongregacaoResponseDTO response = congregacaoService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Atualizado para chamar o método do Service
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_GERAL')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        congregacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
    
 // Atualizar congregação existente
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_GERAL')")
    public ResponseEntity<CongregacaoResponseDTO> atualizar(
            @PathVariable Long id, 
            @Valid @RequestBody CongregacaoRequestDTO request) {
        CongregacaoResponseDTO response = congregacaoService.atualizar(id, request);
        return ResponseEntity.ok(response);
    }
}