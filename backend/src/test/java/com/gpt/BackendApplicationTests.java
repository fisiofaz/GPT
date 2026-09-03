package com.gpt;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @Test
    void deveConsultarCongregacaoCriadaPelaMigration() {

        Congregacao congregacao = congregacaoRepository.findById(1L)
                .orElseThrow();

        assertThat(congregacao.getNome())
                .isEqualTo("Congregação Central");

        assertThat(congregacao.getCidade())
                .isEqualTo("Santa Maria");

        assertThat(congregacao.getEstado())
                .isEqualTo("RS");

        assertThat(congregacao.getNumero())
                .isEqualTo("000");
    }
}