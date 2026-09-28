package com.gpt.modulos.publicador.service;

import com.gpt.modulos.publicador.dto.HistoricoPublicadorResponseDTO;
import com.gpt.modulos.publicador.model.EventoHistoricoPublicador;
import com.gpt.modulos.publicador.model.HistoricoPublicador;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.HistoricoPublicadorRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoricoPublicadorService {

    private final HistoricoPublicadorRepository historicoRepository;

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

    @Transactional(readOnly = true)
    public List<HistoricoPublicadorResponseDTO> listarPorPublicador(
            Long publicadorId
    ) {
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
        Page<HistoricoPublicador> pagina =
                historicoRepository
                        .findByCongregacaoIdOrderByDataEventoDesc(
                                congregacaoId,
                                pageable
                        );

        return PageResponse.from(
                pagina.map(this::toDTO)
        );
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