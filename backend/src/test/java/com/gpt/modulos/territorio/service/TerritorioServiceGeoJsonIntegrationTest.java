package com.gpt.modulos.territorio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.territorio.dto.GeoJsonPolygonDTO;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.usuario.enums.RoleName;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;

import java.util.List;
import java.util.HashSet;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TerritorioServiceGeoJsonIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private TerritorioService territorioService;

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @AfterEach
    void limparSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveAtualizarPoligonoGeoJsonValido() {

    	Congregacao congregacao = Congregacao.builder()
    	        .nome("Congregação Teste")
    	        .cidade("Santa Maria")
    	        .estado("RS")
    	        .numero("001")
    	        .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role role = Role.builder()
                .nome(RoleName.ROLE_ADMIN_GERAL.name())
                .build();

        Usuario usuario = Usuario.builder()
                .nome("Administrador")
                .email("admin.geojson@teste.com")
                .senha("senha")
                .congregacao(congregacao)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(role);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getRoles().stream()
                                .map(r -> (org.springframework.security.core.GrantedAuthority)
                                        () -> r.getNome())
                                .toList()
                )
        );

        TerritorioRequestDTO request = new TerritorioRequestDTO();
        request.setNumero("100");
        request.setNome("Bairro Teste");
        request.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(request);

        GeoJsonPolygonDTO geoJson = new GeoJsonPolygonDTO();
        geoJson.setType("Polygon");

        geoJson.setCoordinates(List.of(
                List.of(
                        List.of(-53.8061, -29.6842),
                        List.of(-53.8050, -29.6842),
                        List.of(-53.8050, -29.6832),
                        List.of(-53.8061, -29.6832),
                        List.of(-53.8061, -29.6842)
                )
        ));

        territorioService.atualizarPoligono(
                territorio.getId(),
                geoJson
        );

        TerritorioResponseDTO resultado =
                territorioService.buscarPorId(territorio.getId());

        assertThat(resultado.getPoligonoGeojson())
                .isNotBlank();

        assertThat(resultado.getPoligonoGeojson())
                .contains("\"type\":\"Polygon\"");
    }
    
    @Test
    void deveImpedirAtualizacaoDeGeoJsonComTipoInvalido() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Teste")
                .cidade("Santa Maria")
                .estado("RS")
                .numero("002")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role role = Role.builder()
                .nome(RoleName.ROLE_ADMIN_GERAL.name())
                .build();

        Usuario usuario = Usuario.builder()
                .nome("Administrador")
                .email("admin.geojson.invalido@teste.com")
                .senha("senha")
                .congregacao(congregacao)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(role);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getRoles().stream()
                                .map(r -> (org.springframework.security.core.GrantedAuthority)
                                        () -> r.getNome())
                                .toList()
                )
        );

        TerritorioRequestDTO request = new TerritorioRequestDTO();
        request.setNumero("101");
        request.setNome("Bairro Teste");
        request.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(request);

        GeoJsonPolygonDTO geoJson = new GeoJsonPolygonDTO();
        geoJson.setType("Point");

        geoJson.setCoordinates(List.of(
                List.of(
                        List.of(-53.8061, -29.6842),
                        List.of(-53.8050, -29.6842),
                        List.of(-53.8050, -29.6832),
                        List.of(-53.8061, -29.6832),
                        List.of(-53.8061, -29.6842)
                )
        ));

        assertThatThrownBy(() ->
	        territorioService.atualizarPoligono(
	                territorio.getId(),
	                geoJson
	        )
	)
	        .isInstanceOf(IllegalArgumentException.class)
	        .hasMessage("O GeoJSON deve possuir o tipo 'Polygon'.");
    }
    
    @Test
    void deveImpedirAtualizacaoDeGeoJsonComCoordenadasVazias() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Teste")
                .cidade("Santa Maria")
                .estado("RS")
                .numero("003")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role role = Role.builder()
                .nome(RoleName.ROLE_ADMIN_GERAL.name())
                .build();

        Usuario usuario = Usuario.builder()
                .nome("Administrador")
                .email("admin.geojson.vazio@teste.com")
                .senha("senha")
                .congregacao(congregacao)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(role);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getRoles().stream()
                                .map(r -> (org.springframework.security.core.GrantedAuthority)
                                        () -> r.getNome())
                                .toList()
                )
        );

        TerritorioRequestDTO request = new TerritorioRequestDTO();
        request.setNumero("102");
        request.setNome("Bairro Teste");
        request.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(request);

        GeoJsonPolygonDTO geoJson = new GeoJsonPolygonDTO();
        geoJson.setType("Polygon");
        geoJson.setCoordinates(List.of());

        assertThatThrownBy(() ->
                territorioService.atualizarPoligono(
                        territorio.getId(),
                        geoJson
                )
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O Polygon deve possuir pelo menos um anel de coordenadas.");
    }
    
    @Test
    void deveImpedirAtualizacaoDeGeoJsonComMenosDeQuatroPontos() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Teste")
                .cidade("Santa Maria")
                .estado("RS")
                .numero("004")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role role = Role.builder()
                .nome(RoleName.ROLE_ADMIN_GERAL.name())
                .build();

        Usuario usuario = Usuario.builder()
                .nome("Administrador")
                .email("admin.geojson.pontos@teste.com")
                .senha("senha")
                .congregacao(congregacao)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(role);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getRoles().stream()
                                .map(r -> (org.springframework.security.core.GrantedAuthority)
                                        () -> r.getNome())
                                .toList()
                )
        );

        TerritorioRequestDTO request = new TerritorioRequestDTO();
        request.setNumero("103");
        request.setNome("Bairro Teste");
        request.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(request);

        GeoJsonPolygonDTO geoJson = new GeoJsonPolygonDTO();
        geoJson.setType("Polygon");

        geoJson.setCoordinates(List.of(
                List.of(
                        List.of(-53.8061, -29.6842),
                        List.of(-53.8050, -29.6842),
                        List.of(-53.8050, -29.6832)
                )
        ));

        assertThatThrownBy(() ->
                territorioService.atualizarPoligono(
                        territorio.getId(),
                        geoJson
                )
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O Polygon deve possuir pelo menos 4 posições, incluindo o fechamento do anel.");
    }
    
    @Test
    void deveImpedirAtualizacaoDeGeoJsonComLongitudeForaDoIntervalo() {

    	Congregacao congregacao = congregacaoRepository.save(
    	        Congregacao.builder()
    	                .nome("Congregação Teste")
    	                .numero("005")
    	                .cidade("Santa Maria")
    	                .estado("RS")
    	                .build()
    	);

        Role role = Role.builder()
                .nome(RoleName.ROLE_ADMIN_GERAL.name())
                .build();

        Usuario usuario = Usuario.builder()
                .nome("Administrador")
                .email("admin5@teste.com")
                .senha("123456")
                .congregacao(congregacao)
                .roles(new HashSet<>(List.of(role)))
                .build();

        TerritorioRequestDTO request = new TerritorioRequestDTO();
        request.setNumero("105");
        request.setNome("Território Teste");
        request.setCongregacaoId(congregacao.getId());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getRoles().stream()
                                .map(r -> (org.springframework.security.core.GrantedAuthority)
                                        () -> r.getNome())
                                .toList()
                )
        );

        TerritorioResponseDTO territorio = territorioService.criar(request);

        GeoJsonPolygonDTO geoJson = new GeoJsonPolygonDTO();
        geoJson.setType("Polygon");
        geoJson.setCoordinates(
                List.of(
                        List.of(
                                List.of(181.0, -29.6842),
                                List.of(180.0, -29.6842),
                                List.of(180.0, -29.6832),
                                List.of(181.0, -29.6832),
                                List.of(181.0, -29.6842)
                        )
                )
        );

        assertThatThrownBy(() ->
                territorioService.atualizarPoligono(
                        territorio.getId(),
                        geoJson
                )
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Longitude inválida: 181.0");
    }
    
    @Test
    void deveImpedirAtualizacaoDeGeoJsonComLatitudeForaDoIntervalo() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("006")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .build()
        );

        Usuario usuario = Usuario.builder()
                .nome("Usuário Teste")
                .email("usuario.teste@example.com")
                .senha("123456")
                .congregacao(congregacao)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(
                Role.builder()
                        .nome(RoleName.ROLE_ADMIN_GERAL.name())
                        .build()
        );

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getRoles().stream()
                                .map(r -> (org.springframework.security.core.GrantedAuthority)
                                        () -> r.getNome())
                                .toList()
                )
        );

        TerritorioRequestDTO territorioRequest = new TerritorioRequestDTO();
        territorioRequest.setNumero("006");
        territorioRequest.setNome("Território Teste");
        territorioRequest.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(territorioRequest);

        GeoJsonPolygonDTO geoJson = new GeoJsonPolygonDTO();
        geoJson.setType("Polygon");
        geoJson.setCoordinates(
                List.of(
                        List.of(
                                List.of(-53.8061, 91.0),
                                List.of(-53.8050, -29.6842),
                                List.of(-53.8050, -29.6832),
                                List.of(-53.8061, -29.6832),
                                List.of(-53.8061, -29.6842)
                        )
                )
        );

        assertThatThrownBy(() ->
                territorioService.atualizarPoligono(
                        territorio.getId(),
                        geoJson
                )
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Latitude inválida: 91.0");
    }
    
    @Test
    void deveImpedirAtualizacaoDeGeoJsonComAnelNaoFechado() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("007")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .build()
        );

        Usuario usuario = Usuario.builder()
                .nome("Usuário Teste")
                .email("usuario.teste@example.com")
                .senha("123456")
                .congregacao(congregacao)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(
                Role.builder()
                        .nome(RoleName.ROLE_ADMIN_GERAL.name())
                        .build()
        );

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getRoles().stream()
                                .map(r -> (org.springframework.security.core.GrantedAuthority)
                                        () -> r.getNome())
                                .toList()
                )
        );

        TerritorioRequestDTO territorioRequest = new TerritorioRequestDTO();
        territorioRequest.setNumero("007");
        territorioRequest.setNome("Território Teste");
        territorioRequest.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(territorioRequest);

        GeoJsonPolygonDTO geoJson = new GeoJsonPolygonDTO();
        geoJson.setType("Polygon");
        geoJson.setCoordinates(
                List.of(
                        List.of(
                                List.of(-53.8061, -29.6842),
                                List.of(-53.8050, -29.6842),
                                List.of(-53.8050, -29.6832),
                                List.of(-53.8061, -29.6832),
                                List.of(-53.8060, -29.6840)
                        )
                )
        );

        assertThatThrownBy(() ->
                territorioService.atualizarPoligono(
                        territorio.getId(),
                        geoJson
                )
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("O Polygon deve possuir o primeiro ponto repetido no final para fechar o anel.");
    }
}