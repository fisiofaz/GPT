package com.gpt.modulos.usuario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

import com.gpt.modulos.usuario.model.Usuario;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponseDTO {
    private Long id;
    private String nome;
    private String email;
    private Boolean ativo;
    private Long congregacaoId;
    private String congregacaoNome;
    private List<String> roles;
    
    public UsuarioResponseDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.ativo = usuario.getAtivo();
        
        if (usuario.getCongregacao() != null) {
            this.congregacaoId = usuario.getCongregacao().getId();
            this.congregacaoNome = usuario.getCongregacao().getNome();
        }
        
        if (usuario.getRoles() != null) {
            this.roles = usuario.getRoles().stream()
                .map(role -> role.getNome())
                .collect(Collectors.toList()); 
        }
    }
}