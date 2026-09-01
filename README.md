# 📖 GPT — Gestão de Publicações e Territórios

Sistema web completo de alta performance desenvolvido para otimizar e automatizar a gestão administrativa de congregações, focado no controle rigoroso de territórios geográficos, inventário de publicações e fluxo de pedidos para Betel.

---

## 🚀 Tecnologias Utilizadas

### **Backend (API REST Multi-Tenant)**

* **Java 21** & **Spring Boot 3**[cite: 1]
* **Spring Security** com autenticação baseada em **JWT (JSON Web Token)**[cite: 1] e controle de acesso por papéis (`RBAC`)
* **Flyway** para versionamento e migrações de banco de dados[cite: 1]
* **PostgreSQL 16**[cite: 1] executado em containers Docker[cite: 1]
* **Arquitetura modular** por domínio e tratamento global de exceções padronizado (`RFC 7807`)[cite: 1]

### **Frontend (Single Page Application)**

* **React 18**[cite: 1] com **TypeScript**[cite: 1] & **Vite**[cite: 1] para build ultrarrápido
* **Tailwind CSS**[cite: 1] para estilização moderna e responsiva
* **React Hook Form**[cite: 1] & **Zod**[cite: 1] para formulários performáticos e validações type-safe
* **Axios**[cite: 1] com interceptadores HTTP para injeção dinâmica de tokens de segurança
* **Leaflet & OpenStreetMap** para mapeamento interativo e desenho de polígonos de territórios[cite: 1]
* **Sonner**[cite: 1] para notificações toast não-bloqueantes

---

## ✨ Funcionalidades Principais

1. **Gestão de Territórios & Mapas:**
   * Cadastro e controle de territórios com status de designação e histórico completo (`Relatório S-13`)[cite: 1].
   * Delimitação e visualização interativa de polígonos geográficos utilizando mapas[cite: 1].
   * Cartão Digital de Território (`S-12`) acessível via mobile com integração de rotas e GPS [Google Maps](cite: 1).
   * Envio automático de orientações e mapas aos publicadores via **WhatsApp**[cite: 1].

2. **Controle de Estoque e Catálogo Mestre:**
   * Catálogo geral padronizado de publicações [Bíblias, livros, brochuras, revistas e tratados](cite: 1).
   * Controle de estoque multi-tenant por congregação com alertas visuais de níveis mínimos[cite: 1].
   * Histórico detalhado de movimentações [entradas por remessas, saídas e inventários](cite: 1).

3. **Fluxo de Pedidos (Publicadores & Betel):**
   * Solicitações especiais de publicadores integradas ao catálogo[cite: 1].
   * Montagem e consolidação de remessas mensais para envio a Betel[cite: 1].
   * Conferência física de caixas item a item com atualização automatizada de estoque e auditoria[cite: 1].

4. **Painel Gerencial (Dashboard):**
   * Indicadores em tempo real de cobertura de territórios e consumo de publicações[cite: 1].
   * Visão unificada de atalhos e resumos operacionais por congregação[cite: 1].

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos

* **Java 21** instalado[cite: 1]
* **Node.js** (versão 18+) instalado
* **Docker** e **Docker Compose** rodando na máquina[cite: 1]

### 1. Clonar o repositório

```bash
git clone [https://github.com/seu-usuario/gpt-sistema.git](https://github.com/seu-usuario/gpt-sistema.git)
cd gpt-sistema
```

### 2. Subir a Infraestrutura (Banco de Dados)
Na raiz do projeto (onde está o **docker-compose.yml**), execute[cite: 1]:

```bash
docker-compose up -d
```

### 3. Configurar e Executar o Backend

```bash
cd backend
# Executar via Maven (ou pela sua IDE favorita configurada com Java 21)
./mvnw spring-boot:run
```
(O servidor iniciará na porta **8080** e as migrações do Flyway rodarão automaticamente).


### 4. Configurar e Executar o Frontend
Em outro terminal, acesse a pasta do frontend:
```bash
cd frontend
# Instalar dependências
npm install
# Iniciar o ambiente de desenvolvimento
npm run dev
```
(O aplicativo web estará acessível em **<http://localhost:5173>**).


## 👥 Permissões e Perfis (RBAC)

- O sistema conta com uma matriz de segurança segregada por papéis:
- **ROLE_ADMIN_GERAL**: Gestão global da plataforma e catálogos mestres.
- **ROLE_ADMIN_CONGREGACAO**: Administração de usuários, estoques e relatórios locais.
- **ROLE_SERVO_TERRITORIOS / ROLE_SERVO_PUBLICACOES:** Operacionalização específica de mapas e publicações.
- **ROLE_PUBLICADOR**: Visualização de designações e pedidos particulares.

## 📄 Licença

Desenvolvido por Fábio André Zatta[cite: 1] sob os termos da licença MIT.

