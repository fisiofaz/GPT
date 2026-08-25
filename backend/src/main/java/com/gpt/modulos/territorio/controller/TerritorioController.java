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

    // Criar território (Permitido para ADMIN_GERAL, ADMIN_CONGREGACAO e SERVO_TERRITORIO)
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<TerritorioResponseDTO> criar(@Valid @RequestBody TerritorioRequestDTO request) {
        TerritorioResponseDTO response = territorioService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Listar territórios por congregação
    @GetMapping("/congregacao/{congregacaoId}")
    public ResponseEntity<List<TerritorioResponseDTO>> listarPorCongregacao(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(territorioService.listarPorCongregacao(congregacaoId));
    }

    // Retirar território
    @PostMapping("/{id}/retirar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<HistoricoTerritorioResponseDTO> retirar(
            @PathVariable Long id,
            @Valid @RequestBody MovimentacaoTerritorioDTO request) {
        return ResponseEntity.ok(territorioService.retirarTerritorio(id, request));
    }

    // Devolver território
    @PostMapping("/{id}/devolver")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<HistoricoTerritorioResponseDTO> devolver(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String observacoes = payload != null ? payload.get("observacoes") : null;
        return ResponseEntity.ok(territorioService.devolverTerritorio(id, observacoes));
    }

    // Histórico de um território
    @GetMapping("/{id}/historico")
    public ResponseEntity<List<HistoricoTerritorioResponseDTO>> listarHistorico(@PathVariable Long id) {
        return ResponseEntity.ok(territorioService.listarHistorico(id));
    }
    
    // Listar histórico geral de toda a congregação
    @GetMapping("/congregacao/{congregacaoId}/historico-geral")
    public ResponseEntity<List<HistoricoTerritorioResponseDTO>> listarHistoricoGeral(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(territorioService.listarHistoricoGeral(congregacaoId));
    }
    
    // Atualizar mapa / polígono do território
    @PatchMapping("/{id}/mapa")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<TerritorioResponseDTO> atualizarPoligono(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String poligonoGeojson = payload != null ? payload.get("poligonoGeojson") : null;
        return ResponseEntity.ok(territorioService.atualizarPoligono(id, poligonoGeojson));
    }
    
    // Endpoint público para visualização no celular do publicador
    @GetMapping("/publico/{id}")
    public ResponseEntity<TerritorioResponseDTO> buscarPublicoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(territorioService.buscarPorId(id));
    }
}