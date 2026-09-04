package com.gpt.modulos.congregacao.service;

import com.gpt.modulos.congregacao.dto.CongregacaoRequestDTO;
import com.gpt.modulos.congregacao.dto.CongregacaoResponseDTO;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CongregacaoServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private CongregacaoService congregacaoService;

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @Test
    void deveCriarCongregacaoAtravésDoService() {
        CongregacaoRequestDTO request = new CongregacaoRequestDTO();
        request.setNome("Congregação Service Teste");
        request.setNumero("998");
        request.setCidade("Santa Maria");
        request.setEstado("rs");

        CongregacaoResponseDTO response = congregacaoService.criar(request);

        assertThat(response.getId()).isNotNull();
        assertThat(response.getNome())
                .isEqualTo("Congregação Service Teste");
        assertThat(response.getNumero())
                .isEqualTo("998");
        assertThat(response.getCidade())
                .isEqualTo("Santa Maria");
        assertThat(response.getEstado())
                .isEqualTo("RS");
        assertThat(response.getCriadoEm())
                .isNotNull();

        assertThat(congregacaoRepository.findById(response.getId()))
                .isPresent();
    }
}