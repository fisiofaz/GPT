package com.gpt;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.congregacao.dto.CongregacaoRequestDTO;
import com.gpt.modulos.congregacao.dto.CongregacaoResponseDTO;
import com.gpt.modulos.congregacao.service.CongregacaoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
class BackendApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private CongregacaoRepository congregacaoRepository;
    
    @Autowired
    private CongregacaoService congregacaoService;
    
    @Autowired
    private MockMvc mockMvc;

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
    }
    
    @Test
    void deveBuscarCongregacaoPorIdAtravésDaApi() throws Exception {

        mockMvc.perform(get("/congregacoes/1")
                        .with(user("admin")
                                .authorities(
                                        new SimpleGrantedAuthority("ROLE_ADMIN_GERAL")
                                )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Congregação Central"))
                .andExpect(jsonPath("$.cidade").value("Santa Maria"))
                .andExpect(jsonPath("$.estado").value("RS"))
                .andExpect(jsonPath("$.numero").value("000"));
    }
    
    @Test
    void deveCriarCongregacaoAtravésDaApi() throws Exception {

        String requestJson = """
                {
                    "nome": "Congregação API Teste",
                    "numero": "997",
                    "cidade": "Santa Maria",
                    "estado": "RS"
                }
                """;

        mockMvc.perform(post("/congregacoes")
                        .with(user("admin")
                                .authorities(
                                        new SimpleGrantedAuthority("ROLE_ADMIN_GERAL")
                                ))
                        .contentType("application/json")
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome").value("Congregação API Teste"))
                .andExpect(jsonPath("$.numero").value("997"))
                .andExpect(jsonPath("$.cidade").value("Santa Maria"))
                .andExpect(jsonPath("$.estado").value("RS"))
                .andExpect(jsonPath("$.criadoEm").exists());
    }
    
    @Test
    void deveAtualizarCongregacaoAtravésDaApi() throws Exception {

        String requestJson = """
                {
                    "nome": "Congregação Atualizada pela API",
                    "numero": "996",
                    "cidade": "Porto Alegre",
                    "estado": "RS"
                }
                """;

        mockMvc.perform(put("/congregacoes/1")
                        .with(user("admin")
                                .authorities(
                                        new SimpleGrantedAuthority("ROLE_ADMIN_GERAL")
                                ))
                        .contentType("application/json")
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Congregação Atualizada pela API"))
                .andExpect(jsonPath("$.numero").value("996"))
                .andExpect(jsonPath("$.cidade").value("Porto Alegre"))
                .andExpect(jsonPath("$.estado").value("RS"));
    }
    
    @Test
    void deveDeletarCongregacaoAtravésDaApi() throws Exception {

        mockMvc.perform(delete("/congregacoes/1")
                        .with(user("admin")
                                .authorities(
                                        new SimpleGrantedAuthority("ROLE_ADMIN_GERAL")
                                )))
                .andExpect(status().isNoContent());

        assertThat(congregacaoRepository.findById(1L))
                .isEmpty();
    }
    
    @Test
    void deveListarTodasAsCongregacoesAtravésDaApi() throws Exception {
        mockMvc.perform(get("/congregacoes")
                        .with(user("admin")
                                .authorities(
                                        new SimpleGrantedAuthority("ROLE_ADMIN_GERAL")
                                )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[0].nome").isNotEmpty())
                .andExpect(jsonPath("$[0].cidade").isNotEmpty())
                .andExpect(jsonPath("$[0].estado").value("RS"));
    }
}