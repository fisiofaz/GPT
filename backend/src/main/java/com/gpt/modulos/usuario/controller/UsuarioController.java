package com.gpt.modulos.usuario.controller;

import com.gpt.modulos.usuario.dto.UsuarioResponseDTO; 
import com.gpt.modulos.usuario.service.UsuarioService;

import jakarta.validation.Valid;

import com.gpt.modulos.usuario.dto.UsuarioRequestDTO;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarPorCongregacao(@PathVariable Long congregacaoId) {
        System.out.println("--> Requisição recebida para listar usuários da congregação ID: " + congregacaoId);
        
        List<UsuarioResponseDTO> usuarios = usuarioService.listarPorCongregacao(congregacaoId);
        
        System.out.println("--> Quantidade de usuários encontrados: " + usuarios.size());
        return ResponseEntity.ok(usuarios);
    }

    @PatchMapping("/{id}/inativar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO')")
    public ResponseEntity<Void> inativarUsuario(@PathVariable Long id) {
        usuarioService.inativar(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO')")
    public ResponseEntity<UsuarioResponseDTO> criarUsuario(@RequestBody UsuarioRequestDTO dto) {
        UsuarioResponseDTO novoUsuario = usuarioService.criar(dto);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(novoUsuario);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(
            @PathVariable Long id, 
            @Valid @RequestBody UsuarioRequestDTO dto) {
        
        UsuarioResponseDTO response = usuarioService.atualizar(id, dto);
        return ResponseEntity.ok(response);
    }
    
}