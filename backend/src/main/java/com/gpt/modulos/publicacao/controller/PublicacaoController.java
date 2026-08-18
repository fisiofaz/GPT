package com.gpt.modulos.publicacao.controller;

import com.gpt.modulos.publicacao.dto.*;
import com.gpt.modulos.publicacao.service.PublicacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/publicacoes")
@RequiredArgsConstructor
public class PublicacaoController {

    private final PublicacaoService publicacaoService;

    // Listar catálogo de publicações (Qualquer usuário autenticado)
    @GetMapping("/catalogo")
    public ResponseEntity<List<PublicacaoResponseDTO>> listarCatalogo() {
        return ResponseEntity.ok(publicacaoService.listarCatalogo());
    }

    // Cadastrar publicação no catálogo global (Apenas ADMIN GERAL)
    @PostMapping("/catalogo")
    @PreAuthorize("hasAuthority('ROLE_ADMIN_GERAL')")
    public ResponseEntity<PublicacaoResponseDTO> cadastrarPublicacao(@Valid @RequestBody PublicacaoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicacaoService.cadastrarPublicacao(request));
    }

    // Listar estoque da congregação
    @GetMapping("/estoque/congregacao/{congregacaoId}")
    public ResponseEntity<List<EstoqueResponseDTO>> listarEstoque(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicacaoService.listarEstoquePorCongregacao(congregacaoId));
    }

    // Atualizar/Abastecer estoque da congregação (ADMIN_GERAL, ADMIN_CONGREGACAO, SERVO_PUBLICACOES)
    @PostMapping("/estoque")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<EstoqueResponseDTO> atualizarEstoque(@Valid @RequestBody AjusteEstoqueDTO request) {
        return ResponseEntity.ok(publicacaoService.atualizarEstoque(request));
    }

    // Fazer solicitação/pedido de publicação (Qualquer usuário autenticado)
    @PostMapping("/pedidos")
    public ResponseEntity<PedidoPublicacaoResponseDTO> solicitar(@Valid @RequestBody PedidoPublicacaoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicacaoService.solicitarPublicacao(request));
    }

    // Atender pedido e dar baixa de estoque (ADMIN_GERAL, ADMIN_CONGREGACAO, SERVO_PUBLICACOES)
    @PostMapping("/pedidos/{id}/atender")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PedidoPublicacaoResponseDTO> atenderPedido(@PathVariable Long id) {
        return ResponseEntity.ok(publicacaoService.atenderPedido(id));
    }

    // Listar todos os pedidos da congregação
    @GetMapping("/pedidos/congregacao/{congregacaoId}")
    public ResponseEntity<List<PedidoPublicacaoResponseDTO>> listarPedidos(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicacaoService.listarPedidosPorCongregacao(congregacaoId));
    }
}