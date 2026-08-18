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

    // Qualquer usuário autenticado pode listar as congregações
    @GetMapping
    public ResponseEntity<List<CongregacaoResponseDTO>> listarTodas() {
        return ResponseEntity.ok(congregacaoService.listarTodas());
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<CongregacaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(congregacaoService.buscarPorId(id));
    }

    // Apenas ADMIN GERAL pode cadastrar novas congregações no sistema
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN_GERAL')")
    public ResponseEntity<CongregacaoResponseDTO> criar(@Valid @RequestBody CongregacaoRequestDTO request) {
        CongregacaoResponseDTO response = congregacaoService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}