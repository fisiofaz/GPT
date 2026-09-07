package com.gpt.modulos.usuario.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.usuario.dto.UsuarioUpdateDTO;
import com.gpt.modulos.usuario.dto.UsuarioResponseDTO;
import com.gpt.modulos.usuario.dto.UsuarioRequestDTO;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.RoleRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import com.gpt.exceptions.BusinessException;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    	if (dto.getCongregacaoId() == null) {
    	    throw new IllegalArgumentException("Selecione uma congregação para este usuário.");
    	}
    	
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
        	throw new BusinessException("Já existe um usuário cadastrado com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setAtivo(true); 
        
        Congregacao congregacao = congregacaoRepository.findById(dto.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));

        usuario.setCongregacao(congregacao);
        
        Set<Role> roles = roleRepository.findByNomeIn(dto.getRoles());

        if (roles.size() != dto.getRoles().size()) {
            throw new IllegalArgumentException("Uma ou mais roles informadas não existem.");
        }

        usuario.setRoles(roles);

        Usuario salvo = usuarioRepository.save(usuario);

        return toDTO(salvo);
    }
    
    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + id));
        
        if (usuarioRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new BusinessException("Já existe outro usuário cadastrado com este e-mail.");
        }
        
        if (dto.getCongregacaoId() == null) {
            throw new IllegalArgumentException("Selecione uma congregação para este usuário.");
        }
        
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }
        
        Congregacao congregacao = congregacaoRepository.findById(dto.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));

        usuario.setCongregacao(congregacao);


        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            Set<Role> roles = roleRepository.findByNomeIn(dto.getRoles());

            if (roles.size() != dto.getRoles().size()) {
                throw new IllegalArgumentException("Uma ou mais roles informadas não existem.");
            }

            usuario.setRoles(roles);
        }

        Usuario atualizado = usuarioRepository.save(usuario);
        return toDTO(atualizado);
    }
    
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarPorCongregacao(Long congregacaoId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();

        boolean isAdminGeral = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN_GERAL".equals(role.getNome()));

        if (!isAdminGeral) {
            Long congregacaoUsuarioId = usuarioAutenticado.getCongregacao() != null
                    ? usuarioAutenticado.getCongregacao().getId()
                    : null;

            if (congregacaoUsuarioId == null || !congregacaoUsuarioId.equals(congregacaoId)) {
                throw new AccessDeniedException(
                        "Você não tem permissão para consultar usuários desta congregação."
                );
            }
        }

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
    	        .orElseThrow(() -> new EntityNotFoundException(
    	                "Usuário não encontrado com ID: " + id
    	        ));
        
        usuario.getRoles().clear();
        usuarioRepository.save(usuario);
        
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
                .congregacaoNome(u.getCongregacao() != null ? u.getCongregacao().getNome() : null)
                .roles(roles)
                .build();
    }  
        
}