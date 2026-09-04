package com.gpt.modulos.congregacao.controller;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
class CongregacaoControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");
  
}