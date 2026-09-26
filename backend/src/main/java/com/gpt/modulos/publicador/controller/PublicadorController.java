package com.gpt.modulos.publicador.controller;

import com.gpt.modulos.publicador.dto.HistoricoPublicadorResponseDTO;
import com.gpt.modulos.publicador.dto.PublicadorRequestDTO;
import com.gpt.modulos.publicador.dto.PublicadorResponseDTO;
import com.gpt.modulos.publicador.service.HistoricoPublicadorService;
import com.gpt.modulos.publicador.service.PublicadorService;
import com.gpt.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
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
    private final HistoricoPublicadorService historicoPublicadorService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<PublicadorResponseDTO> criar(
            @Valid @RequestBody PublicadorRequestDTO request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(publicadorService.criar(request));
    }

    @GetMapping("/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<PageResponse<PublicadorResponseDTO>> listarPorCongregacao(
            @PathVariable Long congregacaoId,
            Pageable pageable) {

        return ResponseEntity.ok(
                publicadorService.listarPorCongregacao(
                        congregacaoId,
                        pageable
                )
        );
    }

    @GetMapping("/historico/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<PageResponse<HistoricoPublicadorResponseDTO>> listarHistoricoPorCongregacao(
            @PathVariable Long congregacaoId,
            Pageable pageable) {

        return ResponseEntity.ok(
        		historicoPublicadorService.listarPorCongregacao(
        		        congregacaoId,
        		        pageable
        		)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<PublicadorResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PublicadorRequestDTO request) {

        return ResponseEntity.ok(
                publicadorService.atualizar(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {

        publicadorService.desativar(id);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reativar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {

        publicadorService.reativar(id);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/definitivo")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<Void> excluirDefinitivamente(@PathVariable Long id) {

        publicadorService.excluirDefinitivamente(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historico")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<List<HistoricoPublicadorResponseDTO>> listarHistorico(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                historicoPublicadorService.listarPorPublicador(id)
        );
    }
}