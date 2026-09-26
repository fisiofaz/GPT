package com.gpt.modulos.publicador.repository;

import com.gpt.modulos.publicador.model.HistoricoPublicador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoPublicadorRepository
        extends JpaRepository<HistoricoPublicador, Long> {

    List<HistoricoPublicador> findByPublicadorIdOrderByDataEventoDesc(
            Long publicadorId
    );

    List<HistoricoPublicador> findByCongregacaoIdOrderByDataEventoDesc(
            Long congregacaoId
    );
}