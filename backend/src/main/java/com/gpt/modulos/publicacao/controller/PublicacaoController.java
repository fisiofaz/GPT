package com.gpt.modulos.publicacao.controller;

import com.gpt.modulos.publicacao.dto.*;
import com.gpt.modulos.publicacao.model.CatalogoMestre;
import com.gpt.modulos.publicacao.repository.CatalogoMestreRepository;
import com.gpt.modulos.publicacao.service.PublicacaoService;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/publicacoes") // Se os outros controllers usam apenas o nome do recurso
@RequiredArgsConstructor
public class PublicacaoController {

    private final PublicacaoService publicacaoService;
    private final UsuarioRepository usuarioRepository;
    private final CatalogoMestreRepository catalogoMestreRepository;

    @GetMapping("/congregacao/{congregacaoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<List<PublicacaoResponseDTO>> listarPorCongregacao(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicacaoService.listarPorCongregacao(congregacaoId));
    }
    
    @GetMapping("/catalogo-mestre")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<List<CatalogoMestre>> listarCatalogoMestre() {
        return ResponseEntity.ok(catalogoMestreRepository.findAllByOrderByTituloAsc());
    }
    
    @PutMapping("/catalogo-mestre/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<CatalogoMestre> atualizarNoCatalogo(
            @PathVariable Long id,
            @RequestBody CatalogoMestre itemAtualizado
    ) {
        return catalogoMestreRepository.findById(id)
                .map(item -> {
                    item.setCodigo(itemAtualizado.getCodigo().trim().toLowerCase());
                    item.setTitulo(itemAtualizado.getTitulo().trim());
                    item.setCategoria(itemAtualizado.getCategoria());
                    item.setFormato(itemAtualizado.getFormato());
                    item.setIdioma(itemAtualizado.getIdioma());
                    item.setDescricao(itemAtualizado.getDescricao());
                    return ResponseEntity.ok(catalogoMestreRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/catalogo-mestre/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO')")
    public ResponseEntity<Void> deletarDoCatalogo(@PathVariable Long id) {
        if (!catalogoMestreRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        catalogoMestreRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO')")
    public ResponseEntity<PublicacaoResponseDTO> cadastrar(
            @Valid @RequestBody PublicacaoRequestDTO dto,
            Authentication authentication
    ) {
        Usuario responsavel = obterUsuarioAutenticado(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(publicacaoService.cadastrar(dto, responsavel));
    }

    @PostMapping("/{id}/movimentar")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<MovimentacaoResponseDTO> movimentar(
            @PathVariable Long id,
            @Valid @RequestBody MovimentacaoEstoqueDTO dto,
            Authentication authentication
    ) {
        Usuario responsavel = obterUsuarioAutenticado(authentication);
        return ResponseEntity.ok(publicacaoService.movimentarEstoque(id, dto, responsavel));
    }

    @GetMapping("/congregacao/{congregacaoId}/historico")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<List<MovimentacaoResponseDTO>> listarHistoricoGeral(@PathVariable Long congregacaoId) {
        return ResponseEntity.ok(publicacaoService.listarHistoricoGeral(congregacaoId));
    }

    private Usuario obterUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return usuarioRepository.findByEmail(authentication.getName()).orElse(null);
    }
    
    @PostMapping("/catalogo-mestre")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO')")
    public ResponseEntity<CatalogoMestre> cadastrarOuAtualizarNoCatalogo(
            @RequestBody CatalogoMestre item
    ) {
        item.setCodigo(item.getCodigo().trim().toLowerCase());
        item.setTitulo(item.getTitulo().trim());
        CatalogoMestre salvo = catalogoMestreRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<PublicacaoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody PublicacaoRequestDTO dto
    ) {
        return ResponseEntity.ok(publicacaoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN_GERAL', 'ROLE_SUPERINTENDENTE_SERVICO', 'ROLE_ANCIAO', 'ROLE_SERVO_PUBLICACOES')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        publicacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}