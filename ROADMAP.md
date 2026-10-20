# 🗺️ Roadmap de Desenvolvimento - GPT (Gestão de Publicações e Territórios)

Documento oficial de acompanhamento das fases e engenharia do projeto GPT - Versão 1.0.

---

## 📌 Fase 1: Fundação do Ambiente, Domínio Base & Autenticação Multi-Tenant (Concluído)

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
- [x] **Task 1.6: Refatoração: Padronização e Refatoração do Backend Spring Boot**
  - [x] Arquitetura modular por features/pacotes
  - [x] Global Exception Handler com RFC 7807 (`ProblemDetail`)
  - [x] Documentação com Swagger / OpenAPI

---

## 📌 Fase 2: Core Business - Módulo de Territórios (Concluído)

- [x] **Task 2.1:** Migrations para tabela `tb_territorio` e tabela de histórico/movimentação.
- [x] **Task 2.2:** Regras de negócio de Retirada e Devolução de Territórios.
- [x] **Task 2.3:** Relatórios de cobertura e territórios pendentes.

---

## 📌 Fase 3: Core Business - Módulo de Publicações (Concluído)

- [x] **Task 3.1:** Migrations para catálogo (`tb_publicacao`), estoque por congregação (`tb_estoque_publicacao`) e pedidos (`tb_pedido_publicacao`).
- [x] **Task 3.2:** Controle de estoque multi-tenant e fluxo de pedidos com baixa automática na entrega.
- [x] **Task 3.3:** Endpoints protegidos por RBAC (`ROLE_ADMIN_GERAL`, `ROLE_ADMIN_CONGREGACAO`, `ROLE_SERVO_PUBLICACOES`).

---

### 🎨 Fase 4: Frontend (React + TypeScript + Vite + Tailwind CSS) (Concluído)

- [x] **Task 4.1:** Configuração do Tailwind CSS no Vite com `@tailwindcss/vite`
- [x] **Task 4.2:** Configuração do cliente HTTP (Axios) com interceptores para injeção de Token JWT
- [x] **Task 4.3:** Gerenciamento de Estado de Autenticação (`AuthContext`, `AuthProvider`, `useAuth`)
- [x] **Task 4.4:** Tela de Login moderna com Dark Glassmorphism e toggle de visualização de senha
- [x] **Task 4.5:** Rotas privadas protegidas (`RotaPrivada`)
- [x] **Task 4.6:** Dashboard inicial moderno com cards de módulos e visão geral

---

## ✅ Módulo 5: Gestão de Territórios & Publicadores (Concluído)

- [x] **Task 5.1:** Cadastro e gerenciamento de Publicadores por congregação
- [x] **Task 5.2:** Listagem e busca em tempo real de publicadores
- [x] **Task 5.3:** Cadastro de Territórios (número, nome/região, descrição)
- [x] **Task 5.4:** Fluxo de Designação/Retirada associando ao Publicador
- [x] **Task 5.5:** Fluxo de Devolução com registro de observações
- [x] **Task 5.6:** Relatório Geral consolidado de designações de mapas (Histórico S-13)
- [x] **Task 5.7:** Exportação para PDF e Impressão formatada em folha A4 oficial
- [x] **Task 5.8:** Delimitação e desenho interativo de polígonos no mapa (Leaflet & OpenStreetMap)
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

## ✅ Módulo 6: Gestão do Estoque de Publicações & Movimentações (Concluído)

- [x] **Task 6.1:** Migration Flyway (`tb_publicacao` e `tb_movimentacao_estoque`)
- [x] **Task 6.2:** Tabela Mestra Global (`tb_catalogo_mestre`) para modelos oficiais de publicações
- [x] **Task 6.3:** Página dedicada de gerenciamento do Catálogo Geral (`/catalogo`) com CRUD completo
- [x] **Task 6.4:** Autopreenchimento inteligente por código no cadastro de itens da congregação
- [x] **Task 6.5:** Catálogo categorizado (Bíblias, Livros, Brochuras, Revistas, Folhetos, Tratados)
- [x] **Task 6.6:** Controle de estoque por congregação e definição de estoque mínimo
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

## ✅ Módulo 7: Pedidos de Publicações para Betel & Pedidos Especiais (Concluído)

- [x] **Task 7.1:** Migration Flyway estruturando tabelas de pedidos de publicadores e pedidos Betel
- [x] **Task 7.2:** Solicitação de pedidos especiais de publicadores vinculados ao Catálogo Mestre Geral
- [x] **Task 7.3:** Painel de triagem e atendimento de pedidos de publicadores (Marcar Atendido / Cancelar)
- [x] **Task 7.4:** Montagem e consolidação da remessa mensal para Betel com busca dinâmica no Catálogo Geral
- [x] **Task 7.5:** Importação com um clique de solicitações de publicadores pendentes para o pedido consolidado
- [x] **Task 7.6:** CRUD de Pedidos de Betel (Criar, Editar rascunho/enviado, Excluir e Marcar como Enviado)
- [x] **Task 7.7:** Fluxo de conferência de chegada da caixa física com conferência item a item
- [x] **Task 7.8:** Entrada e atualização automática no estoque ativo
- [x] **Task 7.9:** Registro automático de auditoria na tabela de movimentação vinculando o responsável logado
- [x] **Task 7.10:** Atualização em cascata do status dos pedidos de publicadores vinculados para `ATENDIDO`
- [x] **Task 7.11:** Acessos e atalhos rápidos integrados ao `Dashboard` e ao cabeçalho de `Publicações`

---

## ✅ Módulo 8: Separação de Domínio: Usuários vs Publicadores (Concluído)

- [x] **Task 8.1:** Modelagem da entidade `Publicador` (ID, Nome, Telefone, Congregação)
- [x] **Task 8.2:** Endpoint de listagem de publicadores da congregação
- [x] **Task 8.3:** Substituição de entrada manual por Select dinâmico de publicadores nos modais
- [x] **Task 8.4:** Correção na atualização de usuários (`PUT /usuarios/{id}`)
- [x] **Task 8.5:** Ajuste na associação de congregações para usuários com perfil `ROLE_ADMIN_GERAL`
- [x] **Task 8.6:** Ajuste no endpoint e na tela React para listagem completa de usuários do sistema
- [x] **Task 8.7:** Painel do Administrador Geral / Administrador de Congregação
- [x] **Task 8.8:** Gestão de permissões por perfil (Servo de Território, Servo de Publicações, Publicador)

---

## ✅ Módulo 9: Dashboard e Métricas Avançadas (Concluído - v1.0)

- [x] **Task 9.1:** Indicadores visuais de cobertura de território em tempo real
- [x] **Task 9.2:** Histórico e estatísticas de consumo de publicações por congregação (`/dashboard/estatisticas/{id}`)
- [x] **Task 9.3:** Painel gerencial unificado com atalhos e resumos operacionais

---

🚀 **Versão 1.0 oficialmente concluída e pronta para produção!**

---

# 🚀 Roadmap de Desenvolvimento — GPT v2.0

## 📌 Fase 10: Evolução e Hardening do Backend — v2.0 (Concluído)

- [x] **Task 10.1: Externalização de configurações sensíveis**
  - [x] Remoção de credenciais e segredos do código versionado.
  - [x] Configuração de variáveis de ambiente.
  - [x] Criação do `.env.example`.
  - [x] Ajustes no `application.properties` para utilização de valores externos.

- [x] **Task 10.2: Consolidação da arquitetura de Usuário, Pessoa e Publicador**
  - [x] Implementação do relacionamento `Usuario → Pessoa → Publicador`.
  - [x] Associação única entre `Usuario` e `Pessoa`.
  - [x] Associação única entre `Pessoa` e `Publicador`.
  - [x] Sincronização dos dados pessoais na atualização do usuário.
  - [x] Validação da situação ativa do publicador.
  - [x] Regras de acesso por congregação e perfil.

- [x] **Task 10.3: Refinamento das regras de autorização**
  - [x] Restrição de operações por congregação.
  - [x] Proteção contra autoexclusão.
  - [x] Proteção contra autoinativação.
  - [x] Restrição de alteração das próprias permissões.
  - [x] Restrição de atribuição de `ROLE_ADMIN_GERAL`.
  - [x] Consolidação da role `ROLE_SUPERINTENDENTE_SERVICO`.
  - [x] Remoção da role legada de publicador.

- [x] **Task 10.4: Consolidação do módulo de Congregações**
  - [x] CRUD de congregações.
  - [x] Validações de acesso.
  - [x] Regras de escopo por congregação.
  - [x] Testes de integração do módulo.

- [x] **Task 10.5: Evolução do domínio de Territórios**
  - [x] Exclusão segura de territórios.
  - [x] Formalização do GeoJSON.
  - [x] Correção dos relacionamentos com histórico.
  - [x] Remoção do status legado `DESIGNADO`.
  - [x] Utilização do usuário autenticado através do `SecurityContext`.

- [x] **Task 10.6: Nova arquitetura de estoque por congregação**
  - [x] Separação entre catálogo global de publicações e estoque da congregação.
  - [x] Criação/consolidação da entidade `PublicacaoEstoque`.
  - [x] Relacionamento `Publicacao → PublicacaoEstoque → Congregacao`.
  - [x] Restrição única por publicação e congregação.
  - [x] Controle de quantidade por congregação.
  - [x] Controle de estoque mínimo por congregação.
  - [x] Identificação de estoque baixo.

- [x] **Task 10.7: Centralização das movimentações de estoque**
  - [x] Implementação de `MovimentacaoService`.
  - [x] Movimentações de `ENTRADA`.
  - [x] Movimentações de `SAIDA`.
  - [x] Movimentações de `AJUSTE`.
  - [x] Registro da quantidade anterior e posterior.
  - [x] Validação para impedir estoque negativo.
  - [x] Histórico de movimentações por publicação e congregação.

- [x] **Task 10.8: Integração do módulo de Pedidos com o estoque**
  - [x] Remoção da alteração direta do estoque pelo `PedidoService`.
  - [x] Utilização do `MovimentacaoService` para registrar saídas.
  - [x] Utilização do `MovimentacaoService` para registrar entradas.
  - [x] Atendimento de pedidos de publicadores com baixa de estoque.
  - [x] Recebimento de pedidos Betel com entrada no estoque.
  - [x] Prevenção de movimentações duplicadas.

- [x] **Task 10.9: Testes de integração do domínio**
  - [x] Testes de integração de Usuário/Pessoa/Publicador.
  - [x] Testes de integração de Congregação.
  - [x] Testes de integração de Territórios.
  - [x] Testes de integração de Estoque.
  - [x] Testes de integração de Movimentações.
  - [x] Testes de integração de Pedidos.
  - [x] Execução completa da suíte de testes.
  
  - [x] **Task 10.10: Auditoria da estrutura do frontend**
  - [x] Revisar estrutura de pastas.
  - [x] Identificar responsabilidades duplicadas.
  - [x] Identificar componentes excessivamente grandes.
  - [x] Identificar regras de negócio diretamente dentro das telas.
  - [x] Identificar código legado da v1.0.

- [x] **Task 10.11: Revisão do gerenciamento de autenticação**
  - [x] Revisar `AuthContext`.
  - [x] Revisar `AuthProvider`.
  - [x] Revisar `useAuth`.
  - [x] Revisar persistência do JWT.
  - [x] Revisar tratamento de expiração do token.
  - [x] Revisar logout.
  - [x] Revisar recuperação do usuário autenticado.

- [x] **Task 10.12: Revisão do cliente HTTP**
  - [x] Revisar configuração do Axios.
  - [x] Revisar interceptor de autenticação.
  - [x] Revisar tratamento global de erros.
  - [x] Padronizar respostas e erros da API.
  - [x] Eliminar chamadas HTTP duplicadas ou inconsistentes.

- [x] **Task 10.13: Revisão das rotas**
  - [x] Revisar `RotaPrivada`.
  - [x] Revisar proteção por autenticação.
  - [x] Revisar proteção por perfil.
  - [x] Revisar escopo por congregação.
  - [x] Centralizar regras de navegação.

- [x] **Task 10.14: Arquitetura de Layout**
  - [x] Criar/ajustar `AppLayout`.
  - [x] Centralizar `Header`.
  - [x] Centralizar `Sidebar`.
  - [x] Implementar navegação responsiva.
  - [x] Implementar menu mobile/hamburger.
  - [x] Centralizar configuração de navegação.
  - [x] Remover navegação duplicada das páginas.

- [x] **Task 10.15: Padronização visual**
  - [x] Padronizar componentes de interface.
  - [x] Padronizar botões.
  - [x] Padronizar modais.
  - [x] Padronizar tabelas.
  - [x] Padronizar formulários.
  - [x] Padronizar estados de loading.
  - [x] Padronizar estados vazios.
  - [x] Padronizar mensagens de erro.
  - [x] Revisar responsividade.
  - [x] Revisar acessibilidade.

- [x] **Task 10.16: Revisão dos módulos existentes**
  - [x] Territórios.
  - [x] Publicadores.
  - [x] Publicações.
  - [x] Movimentações.
  - [x] Pedidos.
  - [x] Usuários.
  - [x] Congregações.
  - [x] Administração.

- [x] **Task 10.17: Revisão do contrato Backend ↔ Frontend**
  - [x] Revisar `DashboardStatsDTO`.
  - [x] Revisar endpoint `/dashboard/estatisticas/{congregacaoId}`.
  - [x] Revisar autorização por congregação.
  - [x] Impedir acesso de uma congregação aos dados de outra.
  - [x] Validar existência da congregação informada.

[x] **Task 11.1: Revisão das métricas**
- [x] Territórios disponíveis.
- [x] Territórios em andamento.
- [x] Territórios trabalhados no ano de serviço.
- [x] Estoque total da congregação.
- [x] Pedidos.
- [x] Congregações ativas para usuários com escopo administrativo.

- [x] **Task 11.2: Histórico de consumo**
  - [x] Revisar origem dos dados de consumo.
  - [x] Utilizar movimentações de estoque como fonte oficial.
  - [x] Considerar movimentações `SAIDA`.
  - [x] Consolidar consumo mensal.
  - [x] Preparar consulta agrupada para reduzir quantidade de queries.

- [x] **Task 11.3: Pedido Regular**
  - [x] Modelagem do fluxo.
  - [x] Criação do pedido.
  - [x] Itens do pedido.
  - [x] Validação de disponibilidade.
  - [x] Atendimento.
  - [x] Baixa de estoque através de `MovimentacaoService`.

- [x] **Task 11.4: Pedido Especial**
  - [x] Solicitação individual por publicador.
  - [x] Vinculação à publicação.
  - [x] Controle de status.
  - [x] Atendimento.
  - [x] Integração com estoque.

- [x] **Task 11.5: Pedido de Campanha**
  - [x] Criação de campanhas.
  - [x] Vinculação de publicações.
  - [x] Controle de participantes.
  - [x] Consolidação das quantidades.
  - [x] Fluxo de atendimento.
  - [x] Integração com estoque.

- [x] **Task 11.6: Unificação do domínio de pedidos**
  - [x] Padronizar estados.
  - [x] Padronizar validações.
  - [x] Centralizar movimentações.
  - [x] Evitar alterações diretas no estoque.
  - [x] Registrar auditoria das operações.

- [x] **Task 11.7: Componentização do Dashboard**
  - [x] `DashboardHeader`.
  - [x] `WelcomeBanner`.
  - [x] `MetricCard`.
  - [x] `GovernanceSection`.
  - [x] `QuickAccessCard`.
  - [x] `ConsumptionChart`.
  - [x] Componentes de loading.
  - [x] Componentes de erro.

- [x] **Task 11.8: Deploy**
  - [x] Deploy do backend.
  - [x] Deploy do frontend.
  - [x] Configuração do banco PostgreSQL.
  - [x] Configuração de domínio.
  - [x] HTTPS.
  - [x] Validação do ambiente publicado.

---

## 🎯 Marco da Versão 2.0

A versão **2.0** será considerada concluída após:

- [x] Backend consolidado e aprovado no Pull Request.
- [x] Arquitetura frontend revisada.
- [x] Layout e navegação centralizados.
- [x] Dashboard 2.0 concluído.
- [x] Fluxos de pedidos regular, especial e campanha implementados.
- [x] Estoque e movimentações totalmente centralizados.
- [x] Testes automatizados cobrindo os fluxos críticos.
- [x] Auditoria e observabilidade revisadas.
- [x] Frontend e backend preparados para produção.
- [x] Deploy validado em ambiente de produção.

---

### 📊 Estado atual do projeto

**Versão 1.0:** ✅ Concluída

**Backend v2.0:** ✅ Em consolidação / Pull Request

**Frontend v2.0:** ✅ Em consolidação / Pull Request

**Dashboard 2.0:** ✅ Em consolidação / Pull Request

**Pedidos avançados:** ✅ Em consolidação / Pull Request

**Preparação para produção:** ✅ Em consolidação / Pull Request

---

🚀 **Próximo passo oficial: concluir a revisão e aprovação do Pull Request do backend v2.0 e, em seguida, iniciar a auditoria completa do frontend.**
