# 🗺️ Roadmap de Desenvolvimento - GPT (Gestão de Publicações e Territórios)

Documento oficial de acompanhamento das fases e tarefas de engenharia do projeto GPT.

---

## 📌 Fase 1: Fundação do Ambiente, Domínio Base & Autenticação Multi-Tenant (Em Progresso)

- [x] **Task 1.1: Infraestrutura Local**
  - [x] Criação do `docker-compose.yml` (PostgreSQL 16 + pgAdmin 4).
  - [x] Configuração de volumes persistentes e redes locais.
- [x] **Task 1.2: Setup do Backend**
  - [x] Inicialização do Spring Boot 3 (Java 21) com estrutura DDD Leve.
  - [x] Configuração do `application.properties` com `ddl-auto=validate`.
  - [x] Implementação do `GlobalExceptionHandler` (RFC 7807).
- [x] **Task 1.3: Modelagem e Banco de Dados (Flyway)**
  - [x] Migration `V1`: Tabelas `tb_congregacao`, `tb_role`, `tb_usuario` e `tb_usuario_role`.
  - [x] Suporte nativo a Papéis Acumuláveis.
- [x] **Task 1.4: Segurança e Autenticação JWT**
  - [x] Implementação do `JwtService` e `JwtAuthenticationFilter`.
  - [x] Configuração de `SecurityConfig` com senhas em BCrypt.
  - [x] Endpoints `POST /api/v1/auth/login` e `POST /api/v1/auth/register`.
- [ ] **Task 1.5: CRUD de Congregações & Usuários (Rotas Protegidas)**
  - [ ] Endpoints protegidos via `Bearer Token`.
  - [ ] Validação de perfil por anotações `@PreAuthorize`.

---

## 📌 Fase 2: Core Business - Módulo de Territórios

- [ ] **Task 2.1:** Migrations para tabela `tb_territorio` e tabela de histórico/movimentação.
- [ ] **Task 2.2:** Regras de negócio de Retirada e Devolução de Territórios.
- [ ] **Task 2.3:** Relatórios de cobertura e territórios pendentes.

---

## 📌 Fase 3: Core Business - Módulo de Publicações

- [ ] **Task 3.1:** Migrations para estoque de publicações e pedidos.
- [ ] **Task 3.2:** Fluxo de solicitação, aprovação e baixa de estoque.

---

## 📌 Fase 4: Frontend (React + Tailwind CSS)

- [ ] **Task 4.1:** Setup do projeto React e integração com Context API / Zustand para autenticação.
- [ ] **Task 4.2:** Telas de Login, Gestão de Territórios e Movimentações.