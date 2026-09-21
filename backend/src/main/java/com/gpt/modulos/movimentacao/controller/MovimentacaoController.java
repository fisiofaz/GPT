package com.gpt.modulos.movimentacao.controller;

import com.gpt.modulos.movimentacao.dto.AjusteEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoResponseDTO;
import com.gpt.modulos.movimentacao.service.MovimentacaoService;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movimentacoes")
@RequiredArgsConstructor
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/publicacao/{publicacaoId}/congregacao/{congregacaoId}")
    @PreAuthorize("""
        hasAnyAuthority(
            'ROLE_ADMIN_GERAL',
            'ROLE_SUPERINTENDENTE_SERVICO',
            'ROLE_ANCIAO',
            'ROLE_SERVO_PUBLICACOES'
        )
    """)
    public ResponseEntity<MovimentacaoResponseDTO> movimentar(
            @PathVariable Long publicacaoId,
            @PathVariable Long congregacaoId,
            @Valid @RequestBody MovimentacaoEstoqueDTO dto,
            Authentication authentication
    ) {

        Usuario responsavel =
                obterUsuarioAutenticado(authentication);

        return ResponseEntity.ok(
                movimentacaoService.movimentar(
                        publicacaoId,
                        congregacaoId,
                        dto,
                        responsavel
                )
        );
    }

    @PostMapping("/ajuste")
    @PreAuthorize("""
        hasAnyAuthority(
            'ROLE_ADMIN_GERAL',
            'ROLE_SUPERINTENDENTE_SERVICO',
            'ROLE_ANCIAO',
            'ROLE_SERVO_PUBLICACOES'
        )
    """)
    public ResponseEntity<MovimentacaoResponseDTO> ajustarEstoque(
            @Valid @RequestBody AjusteEstoqueDTO dto,
            Authentication authentication
    ) {

        Usuario responsavel =
                obterUsuarioAutenticado(authentication);

        return ResponseEntity.ok(
                movimentacaoService.ajustarEstoque(
                        dto,
                        responsavel
                )
        );
    }

    @GetMapping("/congregacao/{congregacaoId}")
    @PreAuthorize("""
        hasAnyAuthority(
            'ROLE_ADMIN_GERAL',
            'ROLE_SUPERINTENDENTE_SERVICO',
            'ROLE_ANCIAO',
            'ROLE_SERVO_PUBLICACOES'
        )
    """)
    public ResponseEntity<List<MovimentacaoResponseDTO>>
    listarHistoricoGeral(
            @PathVariable Long congregacaoId
    ) {

        return ResponseEntity.ok(
                movimentacaoService.listarHistoricoGeral(
                        congregacaoId
                )
        );
    }

    @GetMapping("/publicacao/{publicacaoId}")
    @PreAuthorize("""
        hasAnyAuthority(
            'ROLE_ADMIN_GERAL',
            'ROLE_SUPERINTENDENTE_SERVICO',
            'ROLE_ANCIAO',
            'ROLE_SERVO_PUBLICACOES'
        )
    """)
    public ResponseEntity<List<MovimentacaoResponseDTO>>
    listarPorPublicacao(
            @PathVariable Long publicacaoId
    ) {

        return ResponseEntity.ok(
                movimentacaoService.listarPorPublicacao(
                        publicacaoId
                )
        );
    }

    private Usuario obterUsuarioAutenticado(
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {
            throw new IllegalArgumentException(
                    "Usuário autenticado não encontrado."
            );
        }

        return usuarioRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário autenticado não encontrado."
                ));
    }
}