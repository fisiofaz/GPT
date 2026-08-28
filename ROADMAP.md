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

## ✅ Módulo 5: Gestão de Territórios & Publicadores

- [x] **Task 5.1:** Cadastro e gerenciamento de Publicadores por congregação
- [x] **Task 5.2:** Listagem e busca em tempo real de publicadores
- [x] **Task 5.3:** Cadastro de Territórios (número, nome/região, descrição)
- [x] **Task 5.4:** Fluxo de Designação/Retirada associando ao Publicador
- [x] **Task 5.5:** Fluxo de Devolução com registro de observações
- [x] **Task 5.6:** Relatório Geral consolidado de designações de mapas (Histórico S-13)
- [x] **Task 5.7:** Exportação para PDF e Impressão formatada em folha A4 oficial
  [x] **Task 5.8** Delimitação e desenho interativo de polígonos no mapa (Leaflet & OpenStreetMap)
- [x] **Task 5.9:** Cartão Digital de Território (S-12) com navegação GPS / Google Maps
- [x] **Task 5.10:** Mapa Geral Consolidado da Congregação com painel lateral e busca interativa
- [x] **Task 5.11:** Envio automático do mapa e orientações para o Publicador via WhatsApp
- [x] **Task 5.12: Refatoração & Qualidade de Código:**
  - [x] **Task 5.12.1:** Hook Customizado `useTerritorios` para total separação de regra de negócio e visual
  - [x] **Task 5.12.2:** Schemas de validação type-safe com `Zod` (`territorioSchema`, `designacaoSchema`, `devolucaoSchema`)
  - [x] **Task 5.12.3:** Formulários de alta performance com `React Hook Form`
  - [x] **Task 5.12.4:** Notificações toast modernas não-bloqueantes com `Sonner`
  - [x] **Task 5.12.5:** Modularização em subcomponentes (`ModalCriarTerritorio`, `ModalDesignar`, `ModalDevolver`, `ModalSucessoRetirada`, `ModalRelatorioS13`, `CardTerritorio`)

---

## ✅ Módulo 6: Gestão do Estoque de Publicações & Movimentações

- [x] **Task 6.1:** Modelagem e Migration Flyway (`tb_publicacao` e `tb_movimentacao_estoque`)
- [x] **Task 6.2:** Tabela Mestra Global (`tb_catalogo_mestre`) para modelos oficiais de publicações
- [x] **Task 6.3:** Página dedicada de gerenciamento do Catálogo Geral (`/catalogo`) com CRUD completo
- [x]  **Task 6.4:** Autopreenchimento inteligente por código no cadastro de itens da congregação
- [x] **Task 6.5:** Catálogo categorizado (Bíblias, Livros, Brochuras, Revistas, Folhetos, Tratados)
- [x] **Task 6.6** Controle de estoque por congregação e definição de estoque mínimo
- [x] **Task 6.7:** Alertas visuais de estoque baixo ou zerado
- [x] **Task 6.8:** Registro de movimentações: Entradas (remessas Betel), Saídas (balcão/pioneiros) e Inventário
- [x] **Task 6.9:** Histórico detalhado de movimentações com exportação e impressão
- [x] **Task 6.10:** Interface frontend com busca em tempo real, filtros por categoria e modais responsivos
- [x] **Task 6.11: Refatoração & Qualidade de Código:**
  - [x] **Task 6.11.1:** Separação estrita de responsabilidades com Hook Customizado `usePublicacoes`
  - [x] **Task 6.11.2:** Formulários de alta performance com `React Hook Form` e validação type-safe via `Zod`
  - [x] **Task 6.11.3:** Notificações toast modernas não-bloqueantes com `Sonner`
  - [x] **Task 6.11.4:** Modal customizado de confirmação de exclusão com Tailwind CSS

---

## ✅ Módulo 4: Pedidos de Publicações para Betel & Pedidos Especiais

- [x] **Task 7.1** Migration Flyway (`V10`) estruturando tabelas de pedidos de publicadores e pedidos Betel
- [x] **Task 7.2** Solicitação de pedidos especiais de publicadores vinculados ao Catálogo Mestre Geral
- [x] **Task 7.3** Painel de triagem e atendimento de pedidos de publicadores (Marcar Atendido / Cancelar)
- [x] **Task 7.4** Montagem e consolidação da remessa mensal para Betel com busca dinâmica no Catálogo Geral
- [x] **Task 7.5** Importação com um clique de solicitações de publicadores pendentes para o pedido consolidado
- [x] **Task 7.6** CRUD de Pedidos de Betel (Criar, Editar rascunho/enviado, Excluir e Marcar como Enviado)
- [x] **Task 7.7** Fluxo de conferência de chegada da caixa física com conferência item a item
- [x] **Task 7.8** Entrada e atualização automática no estoque ativo (`tb_publicacao.quantidade_estoque`)
- [x] **Task 7.9** Registro automático de auditoria na tabela `tb_movimentacao_estoque` vinculando o responsável logado
- [x] **Task 7.10** Atualização em cascata do status dos pedidos de publicadores vinculados para `ATENDIDO`
- [x] **Task 7.11** Acessos e atalhos rápidos integrados ao `Dashboard` e ao cabeçalho de `Publicações`

---

## 🚀 Próximas Etapas

### 👥 Separação de Domínio: Usuários vs Publicadores

- [ ] Modelagem da entidade `Publicador` (ID, Nome, Telefone, Congregação)
- [ ] Endpoint de listagem de publicadores da congregação
- [ ] Substituição de entrada manual por Select dinâmico de publicadores nos modais

### 👥 Padronização e Refatoração do Backend Spring Boot**

- [ ] Arquitetura modular por features/pacotes
- [ ] Global Exception Handler com RFC 7807 (`ProblemDetail`)
- [ ] Documentação com Swagger / OpenAPI

### 👥 Gestão de Usuários e Congregações

- [ ] Painel do Administrador Geral / Administrador de Congregação
- [ ] Gestão de permissões por perfil (Servo de Território, Servo de Publicações, Publicador)
  
### Dashboard e Métricas Avançadas

- [ ] Indicadores visuais de cobertura de território no ano de serviço
- [ ] Histórico de consumo de publicações
