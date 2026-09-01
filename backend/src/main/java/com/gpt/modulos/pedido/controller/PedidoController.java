package com.gpt.modulos.pedido.controller;

import com.gpt.modulos.pedido.dto.PedidoBetelDTO;
import com.gpt.modulos.pedido.dto.PedidoPublicadorDTO;
import com.gpt.modulos.pedido.enums.StatusPedidoPublicador;
import com.gpt.modulos.pedido.service.PedidoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping("/publicador")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PedidoPublicadorDTO.Response> criarPedidoPublicador(
            @RequestBody @Valid PedidoPublicadorDTO.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.criarPedidoPublicador(dto));
    }

    @GetMapping("/publicador/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<List<PedidoPublicadorDTO.Response>> listarPedidosPublicadores(
            @PathVariable Long congregacaoId,
            @RequestParam(required = false) StatusPedidoPublicador status) {
        return ResponseEntity.ok(pedidoService.listarPedidosPublicadores(congregacaoId, status));
    }

    @PatchMapping("/publicador/{id}/atender")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<Void> marcarPedidoPublicadorAtendido(@PathVariable Long id) {
        pedidoService.marcarPedidoPublicadorAtendido(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/publicador/{id}/cancelar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<Void> cancelarPedidoPublicador(@PathVariable Long id) {
        pedidoService.cancelarPedidoPublicador(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/betel")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PedidoBetelDTO.Response> criarPedidoBetel(
            @RequestBody @Valid PedidoBetelDTO.CriarRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.criarPedidoBetel(dto));
    }

    @GetMapping("/betel/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<List<PedidoBetelDTO.Response>> listarPedidosBetel(
            @PathVariable Long congregacaoId) {
        return ResponseEntity.ok(pedidoService.listarPedidosBetel(congregacaoId));
    }

    @GetMapping("/betel/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PedidoBetelDTO.Response> buscarPedidoBetelPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPedidoBetelPorId(id));
    }

    @PatchMapping("/betel/{id}/enviar")
    public ResponseEntity<PedidoBetelDTO.Response> marcarComoEnviado(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.marcarComoEnviado(id));
    }

    @PostMapping("/betel/{id}/receber")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PedidoBetelDTO.Response> registrarRecebimento(
            @PathVariable Long id,
            @RequestBody @Valid PedidoBetelDTO.ConferirPedidoRequest dto) {
        return ResponseEntity.ok(pedidoService.registrarRecebimento(id, dto));
    }
    
    @PutMapping("/betel/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PedidoBetelDTO.Response> atualizarPedidoBetel(
            @PathVariable Long id,
            @RequestBody @Valid PedidoBetelDTO.CriarRequest dto) {
        return ResponseEntity.ok(pedidoService.atualizarPedidoBetel(id, dto));
    }

    @DeleteMapping("/betel/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<Void> excluirPedidoBetel(@PathVariable Long id) {
        pedidoService.excluirPedidoBetel(id);
        return ResponseEntity.noContent().build();
    }
}