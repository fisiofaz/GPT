package com.gpt.modulos.territorio.controller;

import com.gpt.modulos.territorio.dto.HistoricoTerritorioResponseDTO;
import com.gpt.modulos.territorio.dto.MovimentacaoTerritorioDTO;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.territorio.service.TerritorioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/territorios")
@RequiredArgsConstructor
public class TerritorioController {

    private final TerritorioService territorioService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO')")
    public ResponseEntity<TerritorioResponseDTO> criar(@Valid @RequestBody TerritorioRequestDTO request) {
        TerritorioResponseDTO response = territorioService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<List<TerritorioResponseDTO>> listarPorCongregacao(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(territorioService.listarPorCongregacao(congregacaoId));
    }

    @PostMapping("/{id}/retirar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO','ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<HistoricoTerritorioResponseDTO> retirar(
            @PathVariable Long id,
            @Valid @RequestBody MovimentacaoTerritorioDTO request) {
        return ResponseEntity.ok(territorioService.retirarTerritorio(id, request));
    }

    @PostMapping("/{id}/devolver")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO','ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<HistoricoTerritorioResponseDTO> devolver(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String observacoes = payload != null ? payload.get("observacoes") : null;
        return ResponseEntity.ok(territorioService.devolverTerritorio(id, observacoes));
    }

    @GetMapping("/{id}/historico")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<List<HistoricoTerritorioResponseDTO>> listarHistorico(@PathVariable Long id) {
        return ResponseEntity.ok(territorioService.listarHistorico(id));
    }

    @GetMapping("/congregacao/{congregacaoId}/historico")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<List<HistoricoTerritorioResponseDTO>> listarHistoricoGeral(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(territorioService.listarHistoricoGeral(congregacaoId));
    }

    @PatchMapping("/{id}/mapa")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<TerritorioResponseDTO> atualizarPoligono(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String poligonoGeojson = payload != null ? payload.get("poligonoGeojson") : null;
        return ResponseEntity.ok(territorioService.atualizarPoligono(id, poligonoGeojson));
    }

    @GetMapping("/publico/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<TerritorioResponseDTO> buscarPublicoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(territorioService.buscarPorId(id));
    }
}