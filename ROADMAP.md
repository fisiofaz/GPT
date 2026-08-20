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
- [x] **Task 1.5: CRUD de Congregações & Usuários (Rotas Protegidas)**
  - [x] Endpoints protegidos via `Bearer Token`.
  - [x] Validação de perfil por anotações `@PreAuthorize`.

---

## 📌 Fase 2: Core Business - Módulo de Territórios

- [x] **Task 2.1:** Migrations para tabela `tb_territorio` e tabela de histórico/movimentação.
- [x] **Task 2.2:** Regras de negócio de Retirada e Devolução de Territórios.
- [x] **Task 2.3:** Relatórios de cobertura e territórios pendentes.

---

## 📌 Fase 3: Core Business - Módulo de Publicações

- [x] **Task 3.1:** Migrations para catálogo (`tb_publicacao`), estoque por congregação (`tb_estoque_publicacao`) e pedidos (`tb_pedido_publicacao`).
- [x] **Task 3.2:** Controle de estoque multi-tenant e fluxo de pedidos com baixa automática na entrega.
- [x] **Task 3.3:** Endpoints protegidos por RBAC (`ROLE_ADMIN_GERAL`, `ROLE_ADMIN_CONGREGACAO`, `ROLE_SERVO_PUBLICACOES`).

---

### 🎨 Fase 4: Frontend (React + TypeScript + Vite + Tailwind CSS)

- [x] **Task 4.1:** Configuração do Tailwind CSS no Vite com `@tailwindcss/vite`
- [x] **Task 4.2:** Configuração do cliente HTTP (Axios) com interceptores para injeção de Token JWT
- [x] **Task 4.3:** Gerenciamento de Estado de Autenticação (`AuthContext`, `AuthProvider`, `useAuth`)
- [x] **Task 4.4:** Tela de Login moderna com Dark Glassmorphism e toggle de visualização de senha
- [x] **Task 4.5:** Rotas privadas protegidas (`RotaPrivada`)
- [x] **Task 4.6:** Dashboard inicial moderno com cards de módulos e visão geral

---

### 🗺️ Módulo de Gestão de Territórios

- [x] Listagem e busca de territórios filtrados por congregação
- [x] Filtros em tempo real por status (Disponível, Em Uso, Em Atraso)
- [x] Cadastro de novos territórios com validação de congregação
- [x] Fluxos de Retirada e Devolução de territórios
- [x] Modal de Histórico e Linha do Tempo das movimentações

---

## 🚀 Próximas Etapas

### 👥 Separação de Domínio: Usuários vs Publicadores

- [ ] Modelagem da entidade `Publicador` (ID, Nome, Telefone, Congregação)
- [ ] Endpoint de listagem de publicadores da congregação
- [ ] Substituição de entrada manual por Select dinâmico de publicadores nos modais

### 📚 Módulo de Publicações

- [ ] Catálogo de Publicações (Bíblias, Livros, Folhetos, Revistas)
- [ ] Controle de estoque por congregação
- [ ] Sistema de pedidos e solicitações de publicadores

### 👥 Gestão de Usuários e Congregações

- [ ] Painel do Administrador Geral / Administrador de Congregação
- [ ] Gestão de permissões por perfil (Servo de Território, Servo de Publicações, Publicador)
