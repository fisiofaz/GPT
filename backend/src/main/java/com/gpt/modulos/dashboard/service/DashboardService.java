package com.gpt.modulos.dashboard.service;

import com.gpt.modulos.dashboard.dto.DashboardStatsDTO;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.territorio.repository.HistoricoTerritorioRepository;
import com.gpt.modulos.pedido.repository.PedidoPublicadorRepository;
import com.gpt.modulos.territorio.repository.TerritorioRepository;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gpt.modulos.territorio.enums.StatusTerritorio;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TerritorioRepository territorioRepository;
    private final HistoricoTerritorioRepository historicoTerritorioRepository;
    private final PublicacaoEstoqueRepository publicacaoEstoqueRepository;
    private final PedidoPublicadorRepository pedidoPublicadorRepository;
    private final CongregacaoRepository congregacaoRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO obterEstatisticas(Long congregacaoId) {
        LocalDate hoje = LocalDate.now();
        int anoInicio = (hoje.getMonthValue() >= Month.SEPTEMBER.getValue()) ? hoje.getYear() : hoje.getYear() - 1;
        LocalDateTime inicioAnoServico = LocalDate.of(anoInicio, Month.SEPTEMBER, 1).atStartOfDay();
        LocalDateTime fimAnoServico = LocalDate.of(anoInicio + 1, Month.AUGUST, 31).atTime(23, 59, 59);

        long disponiveis = territorioRepository.countByCongregacaoIdAndStatus(congregacaoId, StatusTerritorio.DISPONIVEL);
        long emAndamento = territorioRepository.countByCongregacaoIdAndStatus(congregacaoId, StatusTerritorio.EM_TRABALHO);
        long trabalhadosAnoServico = historicoTerritorioRepository.countTerritoriosTrabalhadosNoPeriodo(
                congregacaoId, inicioAnoServico, fimAnoServico
        );

        long estoqueTotal =
                publicacaoEstoqueRepository.sumQuantidadeByCongregacaoId(congregacaoId);

        long totalPedidos = pedidoPublicadorRepository.countByCongregacaoId(congregacaoId);

        long congregacoesAtivas = congregacaoRepository.count();

        List<DashboardStatsDTO.HistoricoConsumoDTO> historicoConsumo = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate mesReferencia = hoje.minusMonths(i);
            LocalDateTime inicioMes = mesReferencia.withDayOfMonth(1).atStartOfDay();
            LocalDateTime fimMes = mesReferencia.withDayOfMonth(mesReferencia.lengthOfMonth()).atTime(23, 59, 59);

            long totalSaidas = pedidoPublicadorRepository.sumItensEntreguesNoPeriodo(congregacaoId, inicioMes, fimMes);
            String labelMes = mesReferencia.format(DateTimeFormatter.ofPattern("MM/yyyy"));
            
            historicoConsumo.add(new DashboardStatsDTO.HistoricoConsumoDTO(labelMes, totalSaidas));
        }

        return DashboardStatsDTO.builder()
                .territoriosDisponiveis(disponiveis)
                .territoriosEmAndamento(emAndamento)
                .territoriosTrabalhadosAnoServico(trabalhadosAnoServico)
                .totalItensEstoque(estoqueTotal)
                .totalPedidos(totalPedidos)
                .totalCongregacoesAtivas(congregacoesAtivas)
                .historicoConsumo(historicoConsumo)
                .build();
    }
}