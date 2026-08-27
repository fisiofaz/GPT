package com.gpt.modulos.publicacao.controller;

import com.gpt.modulos.publicacao.dto.*;
import com.gpt.modulos.publicacao.service.PublicacaoService;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/publicacoes") // Se os outros controllers usam apenas o nome do recurso
@RequiredArgsConstructor
public class PublicacaoController {

    private final PublicacaoService publicacaoService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/congregacao/{congregacaoId}")
    public ResponseEntity<List<PublicacaoResponseDTO>> listarPorCongregacao(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicacaoService.listarPorCongregacao(congregacaoId));
    }

    @PostMapping
    public ResponseEntity<PublicacaoResponseDTO> cadastrar(
            @Valid @RequestBody PublicacaoRequestDTO dto,
            Authentication authentication
    ) {
        Usuario responsavel = obterUsuarioAutenticado(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(publicacaoService.cadastrar(dto, responsavel));
    }

    @PostMapping("/{id}/movimentar")
    public ResponseEntity<MovimentacaoResponseDTO> movimentar(
            @PathVariable Long id,
            @Valid @RequestBody MovimentacaoEstoqueDTO dto,
            Authentication authentication
    ) {
        Usuario responsavel = obterUsuarioAutenticado(authentication);
        return ResponseEntity.ok(publicacaoService.movimentarEstoque(id, dto, responsavel));
    }

    @GetMapping("/congregacao/{congregacaoId}/historico")
    public ResponseEntity<List<MovimentacaoResponseDTO>> listarHistoricoGeral(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicacaoService.listarHistoricoGeral(congregacaoId));
    }

    private Usuario obterUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return usuarioRepository.findByEmail(authentication.getName()).orElse(null);
    }
}