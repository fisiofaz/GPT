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
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO', 'ROLE_SERVO_TERRITORIO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PublicadorResponseDTO> criar(@Valid @RequestBody PublicadorRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicadorService.criar(request));
    }

    @GetMapping("/congregacao/{congregacaoId}")
    public ResponseEntity<List<PublicadorResponseDTO>> listarPorCongregacao(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicadorService.listarPorCongregacao(congregacaoId));
    }
}