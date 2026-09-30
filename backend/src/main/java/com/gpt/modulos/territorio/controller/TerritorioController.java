package com.gpt.modulos.territorio.controller;

import com.gpt.modulos.territorio.dto.AtualizarPoligonoRequestDTO;
import com.gpt.modulos.territorio.dto.HistoricoTerritorioResponseDTO;
import com.gpt.modulos.territorio.dto.MovimentacaoTerritorioDTO;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.territorio.dto.TerritorioAtualizacaoDTO;
import com.gpt.modulos.territorio.service.TerritorioService;
import com.gpt.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
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
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<TerritorioResponseDTO> criar(@Valid @RequestBody TerritorioRequestDTO request) {
        TerritorioResponseDTO response = territorioService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<TerritorioResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody TerritorioAtualizacaoDTO request
    ) {
        return ResponseEntity.ok(
                territorioService.atualizar(id, request)
        );
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO',)")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        territorioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<PageResponse<TerritorioResponseDTO>> listarPorCongregacao(
            @PathVariable Long congregacaoId,
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                territorioService.listarPorCongregacao(
                        congregacaoId,
                        pageable
                )
        );
    }

    @PostMapping("/{id}/retirar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO','ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<HistoricoTerritorioResponseDTO> retirar(
            @PathVariable Long id,
            @Valid @RequestBody MovimentacaoTerritorioDTO request) {
        return ResponseEntity.ok(territorioService.retirarTerritorio(id, request));
    }

    @PostMapping("/{id}/devolver")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO','ROLE_ANCIAO', 'ROLE_SERVO_TERRITORIO')")
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
    public ResponseEntity<PageResponse<HistoricoTerritorioResponseDTO>> listarHistoricoGeral(
            @PathVariable Long congregacaoId,
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                territorioService.listarHistoricoGeral(
                        congregacaoId,
                        pageable
                )
        );
    }

    @PatchMapping("/{id}/mapa")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<TerritorioResponseDTO> atualizarPoligono(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarPoligonoRequestDTO request) {
    	
    	return ResponseEntity.ok(
                territorioService.atualizarPoligono(
                        id,
                        request.getPoligonoGeojson()
                )
        );
    }

    @GetMapping("/publico/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_SERVO_TERRITORIO')")
    public ResponseEntity<TerritorioResponseDTO> buscarPublicoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(territorioService.buscarPorId(id));
    }
}