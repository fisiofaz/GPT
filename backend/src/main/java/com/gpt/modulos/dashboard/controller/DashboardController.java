package com.gpt.modulos.dashboard.controller;

import com.gpt.modulos.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard") 
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // 📊 O endpoint deve responder a /api/v1/dashboard/estatisticas/{id}
    @GetMapping("/estatisticas/{congregacaoId}")
    public ResponseEntity<?> obterEstatisticas(@PathVariable Long congregacaoId) {
        var estatisticas = dashboardService.obterEstatisticas(congregacaoId);
        return ResponseEntity.ok(estatisticas);
    }
}