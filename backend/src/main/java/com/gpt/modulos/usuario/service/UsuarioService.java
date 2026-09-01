package com.gpt.modulos.usuario.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.usuario.dto.UsuarioRequestDTO;
import com.gpt.modulos.usuario.dto.UsuarioResponseDTO;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.RoleRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CongregacaoRepository congregacaoRepository; 
    private final RoleRepository roleRepository;             
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
    	boolean isAdminGeral = dto.getRoles() != null && dto.getRoles().contains("ROLE_ADMIN_GERAL");
    	
    	// Exige congregação se NÃO for Admin Geral
        if (!isAdminGeral && dto.getCongregacaoId() == null) {
            throw new IllegalArgumentException("Selecione uma congregação para este perfil.");
        }
    	
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Já existe um usuário cadastrado com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setAtivo(true); 
        
        if (!isAdminGeral && dto.getCongregacaoId() != null) {
            Congregacao congregacao = congregacaoRepository.findById(dto.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));
            usuario.setCongregacao(congregacao);
        } else {
            usuario.setCongregacao(null);
        }
        
        Set<Role> roles = roleRepository.findByNomeIn(dto.getRoles());
        usuario.setRoles(roles);

        Usuario salvo = usuarioRepository.save(usuario);

        return new UsuarioResponseDTO(salvo);
    }
    
    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + id));

        boolean isAdminGeral = dto.getRoles() != null && dto.getRoles().contains("ROLE_ADMIN_GERAL");

        // Exige congregação apenas se NÃO for Admin Geral
        if (!isAdminGeral && dto.getCongregacaoId() == null) {
            throw new IllegalArgumentException("Selecione uma congregação para este perfil.");
        }

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());

        // Se informou nova senha, atualiza o hash
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        // Associa ou remove a congregação com base no perfil
        if (!isAdminGeral && dto.getCongregacaoId() != null) {
            Congregacao congregacao = congregacaoRepository.findById(dto.getCongregacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));
            usuario.setCongregacao(congregacao);
        } else {
            usuario.setCongregacao(null);
        }

        // Atualiza as Roles
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            Set<Role> roles = roleRepository.findByNomeIn(dto.getRoles());
            usuario.setRoles(roles);
        }

        Usuario atualizado = usuarioRepository.save(usuario);
        return toDTO(atualizado);
    }
    
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarPorCongregacao(Long congregacaoId) {
        List<Usuario> usuarios = usuarioRepository.findByCongregacaoId(congregacaoId);
        return usuarios.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void inativar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + id));
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
    
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deletar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        
        // Remove os vínculos na tabela intermediária (tb_usuario_role) para evitar erro de FK
        usuario.getRoles().clear();
        usuarioRepository.save(usuario);
        
        // Deleta o usuário
        usuarioRepository.delete(usuario);
    }

    private UsuarioResponseDTO toDTO(Usuario u) {
        List<String> roles = u.getRoles().stream()
                .map(Role::getNome)
                .collect(Collectors.toList());

        return UsuarioResponseDTO.builder()
                .id(u.getId())
                .nome(u.getNome())
                .email(u.getEmail())
                .ativo(u.getAtivo())
                .congregacaoId(u.getCongregacao() != null ? u.getCongregacao().getId() : null)
                .roles(roles)
                .build();
    }  
        
}