package com.gpt;

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
    private MockMvc mockMvc;          
    
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
    
    @Test
    void deveNegarCriacaoDeCongregacaoSemAutenticacao() throws Exception {
        String requestJson = """
                {
                    "nome": "Congregação Sem Autenticação",
                    "numero": "995",
                    "cidade": "Santa Maria",
                    "estado": "RS"
                }
                """;

        mockMvc.perform(post("/congregacoes")
                        .contentType("application/json")
                        .content(requestJson))
        		.andExpect(status().isForbidden());
    }
    
    @Test
    void deveNegarCriacaoDeCongregacaoSemPermissao() throws Exception {
        String requestJson = """
                {
                    "nome": "Congregação Sem Permissão",
                    "numero": "994",
                    "cidade": "Santa Maria",
                    "estado": "RS"
                }
                """;

        mockMvc.perform(post("/congregacoes")
                        .with(user("usuario")
                                .authorities(
                                        new SimpleGrantedAuthority("ROLE_ANCIAO")
                                ))
                        .contentType("application/json")
                        .content(requestJson))
                .andExpect(status().isForbidden());
    }
    
    @Test
    void deveRejeitarCriacaoDeCongregacaoComDadosInvalidos() throws Exception {
        String requestJson = """
                {
                    "nome": "",
                    "numero": "993",
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
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void deveRetornarBadRequestAoBuscarCongregacaoInexistente() throws Exception {
        mockMvc.perform(get("/congregacoes/999999")
                        .with(user("admin")
                                .authorities(
                                        new SimpleGrantedAuthority("ROLE_ADMIN_GERAL")
                                )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Congregação não encontrada com o ID: 999999"));
    }
}