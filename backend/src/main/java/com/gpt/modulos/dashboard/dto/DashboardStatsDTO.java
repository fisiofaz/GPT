package com.gpt.modulos.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // Métricas de Territórios
    private Long territoriosDisponiveis;
    private Long territoriosTrabalhadosAnoServico; 
    private Long territoriosEmAndamento;           

    // Métricas de Publicações e Pedidos
    private Long totalItensEstoque;
    private Long totalPedidos;

    // Métricas Administrativas (Apenas Admin Geral)
    private Long totalCongregacoesAtivas;

    private List<HistoricoConsumoDTO> historicoConsumo;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HistoricoConsumoDTO {
        private String mesAno;
        private Long totalSaidas;
    }
}