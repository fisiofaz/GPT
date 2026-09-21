package com.gpt.modulos.usuario.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.usuario.dto.UsuarioUpdateDTO;
import com.gpt.modulos.usuario.dto.UsuarioResponseDTO;
import com.gpt.modulos.usuario.dto.UsuarioRequestDTO;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.RoleRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
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
    private final RoleRepository roleRepository;
    private final PublicadorRepository publicadorRepository;
    private final PasswordEncoder passwordEncoder;
    

    private void validarRolesPermitidas(Set<String> roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();

        boolean isAdminGeral = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN_GERAL".equals(role.getNome()));

        if (!isAdminGeral && roles.contains("ROLE_ADMIN_GERAL")) {
            throw new AccessDeniedException(
                    "Você não tem permissão para atribuir a role ROLE_ADMIN_GERAL."
            );
        }
    }
    
    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();

        boolean isAdminGeral = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN_GERAL".equals(role.getNome()));

        Publicador publicador = publicadorRepository.findById(dto.getPublicadorId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Publicador não encontrado com ID: " + dto.getPublicadorId()
                ));
 
        Pessoa pessoa = publicador.getPessoa();
        
        if (pessoa == null) {
            throw new BusinessException(
                    "O publicador informado não possui uma pessoa vinculada."
            );
        }

        if (!Boolean.TRUE.equals(publicador.getAtivo())) {
            throw new BusinessException(
                    "Não é possível conceder acesso a um publicador inativo."
            );
        }

        if (usuarioRepository.existsByPessoaId(pessoa.getId())) {
            throw new BusinessException(
                    "Este publicador já possui acesso ao sistema."
            );
        }
        
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException(
                    "Já existe um usuário cadastrado com este e-mail."
            );
        }
        
        Congregacao congregacao = publicador.getCongregacao();
        
        if (!isAdminGeral) {

            Long congregacaoUsuarioId = usuarioAutenticado.getCongregacao() != null
                    ? usuarioAutenticado.getCongregacao().getId()
                    : null;

            if (congregacaoUsuarioId == null
                    || !congregacaoUsuarioId.equals(congregacao.getId())) {

                throw new AccessDeniedException(
                        "Você não tem permissão para criar usuários em outra congregação."
                );
            }
        }

        validarRolesPermitidas(dto.getRoles());

        Set<Role> roles = roleRepository.findByNomeIn(dto.getRoles());

        if (roles.size() != dto.getRoles().size()) {
            throw new IllegalArgumentException(
                    "Uma ou mais roles informadas não existem."
            );
        }

        Usuario usuario = new Usuario();
        
        usuario.setPessoa(pessoa);
        usuario.setNome(pessoa.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setAtivo(true);
        usuario.setCongregacao(congregacao);
        usuario.setRoles(roles);

        Usuario salvo = usuarioRepository.save(usuario);

        boolean isSuperintendente = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_SUPERINTENDENTE_SERVICO".equals(role.getNome()));

        boolean novoUsuarioEhSuperintendente =
                dto.getRoles().contains("ROLE_SUPERINTENDENTE_SERVICO");

        if (isSuperintendente && novoUsuarioEhSuperintendente) {
            usuarioAutenticado.getRoles().removeIf(
                    role -> "ROLE_SUPERINTENDENTE_SERVICO".equals(role.getNome())
            );

            usuarioRepository.save(usuarioAutenticado);
        }

        return toDTO(salvo);
        
    }
    
    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com ID: " + id));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();
        
        if (usuarioAutenticado.getId().equals(usuario.getId())
                && !usuarioAutenticado.getRoles().stream()
                .map(Role::getNome)
                .collect(Collectors.toSet())
                .equals(dto.getRoles())) {

            throw new AccessDeniedException(
                    "Você não pode alterar suas próprias roles."
            );
        }

        boolean isAdminGeral = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN_GERAL".equals(role.getNome()));

        if (!isAdminGeral) {
            Long congregacaoUsuarioAutenticadoId = usuarioAutenticado.getCongregacao() != null
                    ? usuarioAutenticado.getCongregacao().getId()
                    : null;

            Long congregacaoUsuarioAlvoId = usuario.getCongregacao() != null
                    ? usuario.getCongregacao().getId()
                    : null;

            if (congregacaoUsuarioAutenticadoId == null
                    || !congregacaoUsuarioAutenticadoId.equals(congregacaoUsuarioAlvoId)) {
                throw new AccessDeniedException(
                        "Você não tem permissão para atualizar usuários de outra congregação."
                );
            }
        }

        if (usuarioRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new BusinessException("Já existe outro usuário cadastrado com este e-mail.");
        }

        Pessoa pessoa = usuario.getPessoa();

        Publicador publicador = publicadorRepository.findByPessoaId(pessoa.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Publicador não encontrado para a pessoa do usuário."
                ));

        if (publicador.getCongregacao() == null) {
            throw new BusinessException(
                    "O publicador não possui uma congregação vinculada."
            );
        }

        usuario.setCongregacao(publicador.getCongregacao());

        pessoa.setNome(dto.getNome());
        
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            
        	validarRolesPermitidas(dto.getRoles());
        	
        	Set<Role> roles = roleRepository.findByNomeIn(dto.getRoles());

            if (roles.size() != dto.getRoles().size()) {
                throw new IllegalArgumentException("Uma ou mais roles informadas não existem.");
            }

            usuario.setRoles(roles);
        }

        Usuario atualizado = usuarioRepository.save(usuario);
        
        boolean isSuperintendente = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_SUPERINTENDENTE_SERVICO".equals(role.getNome()));

        boolean novoUsuarioEhSuperintendente =
                dto.getRoles().contains("ROLE_SUPERINTENDENTE_SERVICO");

        if (isSuperintendente && novoUsuarioEhSuperintendente) {
            usuarioAutenticado.getRoles().removeIf(
                    role -> "ROLE_SUPERINTENDENTE_SERVICO".equals(role.getNome())
            );

            usuarioRepository.save(usuarioAutenticado);
        }
        
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
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuário não encontrado com ID: " + id));
    	
    	Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();
        
        if (usuarioAutenticado.getId().equals(usuario.getId())) {
            throw new IllegalArgumentException(
                    "Você não pode inativar o próprio usuário."
            );
        }

        boolean isAdminGeral = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN_GERAL".equals(role.getNome()));

        if (!isAdminGeral) {
            Long congregacaoUsuarioAutenticadoId = usuarioAutenticado.getCongregacao() != null
                    ? usuarioAutenticado.getCongregacao().getId()
                    : null;

            Long congregacaoUsuarioAlvoId = usuario.getCongregacao() != null
                    ? usuario.getCongregacao().getId()
                    : null;

            if (congregacaoUsuarioAutenticadoId == null
                    || !congregacaoUsuarioAutenticadoId.equals(congregacaoUsuarioAlvoId)) {
                throw new AccessDeniedException(
                        "Você não tem permissão para inativar usuários de outra congregação."
                );
            }
        }
        
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
    	
    	Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Usuario usuarioAutenticado = (Usuario) authentication.getPrincipal();
        
        if (usuarioAutenticado.getId().equals(usuario.getId())) {
            throw new IllegalArgumentException(
                    "Você não pode excluir o próprio usuário."
            );
        }

        boolean isAdminGeral = usuarioAutenticado.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN_GERAL".equals(role.getNome()));

        if (!isAdminGeral) {
            Long congregacaoUsuarioAutenticadoId = usuarioAutenticado.getCongregacao() != null
                    ? usuarioAutenticado.getCongregacao().getId()
                    : null;

            Long congregacaoUsuarioAlvoId = usuario.getCongregacao() != null
                    ? usuario.getCongregacao().getId()
                    : null;

            if (congregacaoUsuarioAutenticadoId == null
                    || !congregacaoUsuarioAutenticadoId.equals(congregacaoUsuarioAlvoId)) {
                throw new AccessDeniedException(
                        "Você não tem permissão para excluir usuários de outra congregação."
                );
            }
        }
        
       
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