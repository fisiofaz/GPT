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
    
    @Test
    void devePersistirNovaCongregacao() {

        Congregacao novaCongregacao = Congregacao.builder()
                .nome("Congregação de Teste")
                .numero("999")
                .cidade("Santa Maria")
                .estado("RS")
                .numeroCircuito("CIR-TESTE")
                .build();

        Congregacao salva = congregacaoRepository.save(novaCongregacao);

        assertThat(salva.getId()).isNotNull();

        Congregacao encontrada = congregacaoRepository.findById(salva.getId())
                .orElseThrow();

        assertThat(encontrada.getNome())
                .isEqualTo("Congregação de Teste");

        assertThat(encontrada.getNumero())
                .isEqualTo("999");

        assertThat(encontrada.getCidade())
                .isEqualTo("Santa Maria");

        assertThat(encontrada.getEstado())
                .isEqualTo("RS");

        assertThat(encontrada.getNumeroCircuito())
                .isEqualTo("CIR-TESTE");

        assertThat(encontrada.getCriadoEm())
                .isNotNull();
    }
}