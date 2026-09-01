package com.gpt.modulos.territorio.repository;

import com.gpt.modulos.territorio.enums.StatusTerritorio;
import com.gpt.modulos.territorio.model.Territorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TerritorioRepository extends JpaRepository<Territorio, Long> {

    // Buscar territórios por congregação (Isolamento Multi-tenant)
    List<Territorio> findByCongregacaoId(Long congregacaoId);

    // Buscar por congregação e status (ex: Listar todos disponíveis da congregação)
    List<Territorio> findByCongregacaoIdAndStatus(Long congregacaoId, StatusTerritorio status);

    // Validar duplicidade de número dentro da mesma congregação
    boolean existsByNumeroAndCongregacaoId(String numero, Long congregacaoId);

    // Buscar por ID e congregação (Garante que um admin não altere território de outro tenant)
    Optional<Territorio> findByIdAndCongregacaoId(Long id, Long congregacaoId);

    // 📊 Métricas para o Dashboard
    long countByCongregacaoId(Long congregacaoId);

    long countByCongregacaoIdAndStatus(Long congregacaoId, StatusTerritorio status);
}