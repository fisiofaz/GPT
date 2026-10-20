package com.gpt.modulos.publicador.service;

import com.gpt.config.security.SecurityUtils;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.publicador.dto.HistoricoPublicadorResponseDTO;
import com.gpt.modulos.publicador.model.EventoHistoricoPublicador;
import com.gpt.modulos.publicador.model.HistoricoPublicador;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.HistoricoPublicadorRepository;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.shared.dto.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoricoPublicadorService {

    private final HistoricoPublicadorRepository historicoRepository;
    private final PublicadorRepository publicadorRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public void registrar(
            Publicador publicador,
            EventoHistoricoPublicador evento
    ) {
        registrar(publicador, evento, null, null);
    }

    @Transactional
    public void registrar(
            Publicador publicador,
            EventoHistoricoPublicador evento,
            String observacoes
    ) {
        registrar(publicador, evento, observacoes, null);
    }

    @Transactional
    public void registrar(
            Publicador publicador,
            EventoHistoricoPublicador evento,
            Usuario usuarioResponsavel
    ) {
        registrar(publicador, evento, null, usuarioResponsavel);
    }

    @Transactional
    public void registrar(
            Publicador publicador,
            EventoHistoricoPublicador evento,
            String observacoes,
            Usuario usuarioResponsavel
    ) {
        HistoricoPublicador historico = HistoricoPublicador.builder()
                .publicadorId(publicador.getId())
                .nomePublicador(publicador.getPessoa().getNome())
                .congregacao(publicador.getCongregacao())
                .evento(evento)
                .usuarioResponsavel(usuarioResponsavel)
                .observacoes(observacoes)
                .build();

        historicoRepository.save(historico);
    }
    
    @Transactional
    public void registrar(
            Publicador publicador,
            EventoHistoricoPublicador evento,
            String observacoes,
            Usuario usuarioResponsavel,
            Congregacao congregacaoHistorico
    ) {
        HistoricoPublicador historico = HistoricoPublicador.builder()
                .publicadorId(publicador.getId())
                .nomePublicador(publicador.getPessoa().getNome())
                .congregacao(congregacaoHistorico)
                .evento(evento)
                .usuarioResponsavel(usuarioResponsavel)
                .observacoes(observacoes)
                .build();

        historicoRepository.save(historico);
    }

    @Transactional(readOnly = true)
    public List<HistoricoPublicadorResponseDTO> listarPorPublicador(
            Long publicadorId
    ) {

        Publicador publicador = publicadorRepository.findById(publicadorId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Publicador não encontrado com ID: " + publicadorId
                ));

        validarAcessoCongregacao(
                publicador.getCongregacao().getId()
        );

        return historicoRepository
                .findByPublicadorIdOrderByDataEventoDesc(publicadorId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<HistoricoPublicadorResponseDTO> listarPorCongregacao(
            Long congregacaoId,
            Pageable pageable
    ) {

        Long congregacaoIdValidado =
                validarAcessoCongregacao(congregacaoId);

        Page<HistoricoPublicador> pagina =
                historicoRepository
                        .findByCongregacaoIdOrderByDataEventoDesc(
                                congregacaoIdValidado,
                                pageable
                        );

        return PageResponse.from(
                pagina.map(this::toDTO)
        );
    }

    private Long validarAcessoCongregacao(
            Long congregacaoIdSolicitada
    ) {

        if (securityUtils.isAdminGeral()) {
            return congregacaoIdSolicitada;
        }

        Long congregacaoIdLogada =
                securityUtils.getCongregacaoIdLogada();

        if (congregacaoIdLogada == null) {
            throw new AccessDeniedException(
                    "Usuário autenticado não possui uma congregação vinculada."
            );
        }

        if (!congregacaoIdLogada.equals(congregacaoIdSolicitada)) {
            throw new AccessDeniedException(
                    "Você não tem permissão para acessar outra congregação."
            );
        }

        return congregacaoIdLogada;
    }

    private HistoricoPublicadorResponseDTO toDTO(
            HistoricoPublicador historico
    ) {
        return HistoricoPublicadorResponseDTO.builder()
                .id(historico.getId())
                .publicadorId(historico.getPublicadorId())
                .nomePublicador(historico.getNomePublicador())
                .congregacaoId(historico.getCongregacao().getId())
                .evento(historico.getEvento())
                .dataEvento(historico.getDataEvento())
                .usuarioResponsavelId(
                        historico.getUsuarioResponsavel() != null
                                ? historico.getUsuarioResponsavel().getId()
                                : null
                )
                .observacoes(historico.getObservacoes())
                .build();
    }
}