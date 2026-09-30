package com.gpt.modulos.territorio.repository;

import com.gpt.modulos.territorio.enums.StatusTerritorio;
import com.gpt.modulos.territorio.model.Territorio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TerritorioRepository extends JpaRepository<Territorio, Long> {

	Page<Territorio> findByCongregacaoId(
            Long congregacaoId,
            Pageable pageable
    );
	
	List<Territorio> findByCongregacaoId(
			Long congregacaoId,
            StatusTerritorio status
    );

    boolean existsByNumeroAndCongregacaoId(String numero, Long congregacaoId);

    Optional<Territorio> findByIdAndCongregacaoId(Long id, Long congregacaoId);

    long countByCongregacaoId(Long congregacaoId);

    long countByCongregacaoIdAndStatus(Long congregacaoId, StatusTerritorio status);
}