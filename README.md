# Foody — Gestão de Pedidos

Sistema de gestão de pedidos de delivery: API REST em **Java 21 + Spring Boot 4** e aplicação web em **React 19 + TypeScript**.

| | |
|---|---|
| **Aplicação** | https://foody.gmpsaas.com |
| **API** | https://foody-api-roa7.onrender.com |
| **Acesso de demonstração** | `demo@foody.com` / `demo1234` (ou crie sua conta na tela de cadastro) |

> A API está no plano gratuito do Render, que hiberna após 15 minutos sem uso.
> O primeiro acesso pode levar cerca de 1 minuto; os seguintes são imediatos.

## Funcionalidades

- **Autenticação:** cadastro (nome, e-mail e senha) e login com e-mail e senha. Todas as rotas, exceto cadastro e login, exigem token JWT.
- **Pedidos:** criação com cliente, endereço de entrega e itens; listagem; busca por ID.
- **Status:** atualização seguindo o fluxo `RECEBIDO → EM_PREPARO → SAIU_PARA_ENTREGA → ENTREGUE`, com cancelamento permitido antes da saída para entrega.
- **Front-end:** lista de pedidos com filtro por status, busca de pedido pelo número, formulário de novo pedido com total em tempo real e preenchimento do endereço pelo CEP, página de detalhe e botões para avançar o status.

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | Java 21, Spring Boot 4.1, Spring Security (OAuth2 Resource Server/JWT), Spring Data JPA, Flyway, Bean Validation |
| Banco | PostgreSQL (Neon) em produção, H2 em memória para rodar localmente sem configuração |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Tailwind CSS |
| Testes | JUnit 5, MockMvc, AssertJ, Vitest |
| Deploy | Render (API via Docker), Neon (PostgreSQL), Vercel (frontend) |

## Estrutura

```
backend/
  src/main/java/br/com/foody/
    auth/      cadastro, login e emissão do JWT
    order/     pedidos: entidades, regras de status, serviço e controller
    user/      usuário e repositório
    config/    segurança, JWT e CORS
    shared/    tratamento global de erros (Problem Details)
  src/main/resources/db/migration/   migrations Flyway (V1, V2, V3)
frontend/
  src/
    auth/      sessão, contexto de autenticação e rotas protegidas
    orders/    tipos, chamadas à API, hooks do TanStack Query, formulário e componentes
    pages/     login, cadastro, lista, novo pedido e detalhe
    lib/       cliente HTTP, formatação e mapeamento de erros
render.yaml    infraestrutura da API no Render
```

## Rodando localmente

### Backend

Pré-requisito: JDK 21 ou superior. Não é preciso instalar Maven nem banco de dados.

```bash
cd backend
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080` usando H2 em memória (perfil `local`).
Para verificar: `GET http://localhost:8080/actuator/health`.

Para usar PostgreSQL, copie `backend/.env.example` para `backend/.env`, preencha a conexão
e o `JWT_SECRET` e rode com o perfil `prod`:

```bash
./mvnw spring-boot:run "-Dspring-boot.run.profiles=prod"
```

As tabelas são criadas pelo Flyway a partir das migrations.

### Frontend

Pré-requisito: Node.js 22.22 ou superior. Com o backend rodando:

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`. Em desenvolvimento, o Vite repassa as chamadas
de `/api` para `http://localhost:8080`, então não é preciso configurar nada.

### Testes

```bash
cd backend && ./mvnw test     # 53 testes: unitários, integração dos endpoints e persistência
cd frontend && npm test       # 27 testes da lógica do formulário de pedido e da busca por ID
```

## API

Todas as rotas de `/api/orders` exigem o header `Authorization: Bearer <token>`.

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| `POST` | `/api/auth/register` | Cadastra o usuário e retorna o token | `201` |
| `POST` | `/api/auth/login` | Autentica e retorna o token | `200` |
| `GET` | `/api/auth/me` | Dados do usuário autenticado | `200` |
| `POST` | `/api/orders` | Cria um pedido (status inicial `RECEBIDO`) | `201` + `Location` |
| `GET` | `/api/orders` | Lista os pedidos, do mais recente ao mais antigo | `200` |
| `GET` | `/api/orders/{id}` | Busca um pedido por ID | `200` |
| `PATCH` | `/api/orders/{id}/status` | Atualiza o status | `200` |

<details>
<summary><b>Exemplos de requisição e resposta</b></summary>

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "demo@foody.com", "password": "demo1234" }
```

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 28800,
  "user": { "id": 1, "name": "Operador Demo", "email": "demo@foody.com" }
}
```

**Criar pedido**

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "João Souza",
  "customerPhone": "(11) 99999-9999",
  "deliveryAddress": {
    "zipCode": "01001-000",
    "street": "Praça da Sé",
    "number": "100",
    "complement": "Apto 4",
    "neighborhood": "Sé",
    "city": "São Paulo",
    "state": "SP"
  },
  "items": [
    { "productName": "Pizza Margherita", "quantity": 2, "unitPrice": 45.90 },
    { "productName": "Refrigerante 2L", "quantity": 1, "unitPrice": 12.00 }
  ]
}
```

```json
{
  "id": 8,
  "customerName": "João Souza",
  "customerPhone": "(11) 99999-9999",
  "deliveryAddress": {
    "street": "Praça da Sé",
    "number": "100",
    "complement": "Apto 4",
    "neighborhood": "Sé",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001-000"
  },
  "status": "RECEBIDO",
  "nextStatuses": ["EM_PREPARO", "CANCELADO"],
  "totalAmount": 103.80,
  "items": [
    { "id": 15, "productName": "Pizza Margherita", "quantity": 2, "unitPrice": 45.90, "subtotal": 91.80 },
    { "id": 16, "productName": "Refrigerante 2L", "quantity": 1, "unitPrice": 12.00, "subtotal": 12.00 }
  ],
  "createdAt": "2026-10-18T20:49:12.345Z",
  "updatedAt": "2026-10-18T20:49:12.345Z"
}
```

O total é sempre calculado pelo servidor a partir dos itens. O campo `nextStatuses` informa
para quais status o pedido pode ir, e o front-end usa esse campo para exibir apenas as ações válidas.

**Atualizar status**

```http
PATCH /api/orders/8/status
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "EM_PREPARO" }
```

**Erros** seguem o padrão [Problem Details (RFC 9457)](https://www.rfc-editor.org/rfc/rfc9457), com os erros de validação por campo:

```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "Um ou mais campos são inválidos.",
  "errors": {
    "deliveryAddress.zipCode": "Informe um CEP válido.",
    "items[0].quantity": "A quantidade deve ser maior que zero."
  }
}
```

</details>

## Decisões técnicas

**Banco de dados**
- **PostgreSQL em vez de SQLite:** o enunciado permite "SQLite ou similar". O PostgreSQL é mais próximo de um ambiente de produção e tem hospedagem gratuita gerenciada (Neon). Para quem só quer rodar o projeto, o perfil padrão usa H2 em memória, sem nenhuma configuração.
- **Flyway com `ddl-auto: validate`:** o schema é versionado em migrations SQL, e o Hibernate apenas confere se as entidades batem com ele. Qualquer divergência impede a aplicação de subir. Alterações de schema entram como novas migrations (por exemplo, a V3 adicionou o controle de versão), nunca editando as já aplicadas.
- **Status como tabela de domínio com chave estrangeira, e não `CHECK constraint`:** além de permitir novos status com um `INSERT`, contorna um bug do H2 2.4 em que `CHECK (... IN (...))` falha depois que a conexão que criou a tabela é fechada.
- **Concorrência otimista (`@Version`):** se dois operadores alteram o mesmo pedido ao mesmo tempo, o segundo recebe `409` em vez de sobrescrever a alteração do primeiro.
- **Sem N+1:** listagem e busca carregam os itens com `join fetch`, em uma única consulta.

**Segurança**
- **JWT com o Resource Server do Spring Security** (HS256), sem biblioteca externa: o framework valida assinatura, expiração e emissor. A API é stateless, e o CSRF fica desabilitado porque o token não trafega em cookie.
- **Senhas com BCrypt**, entre 8 e 72 caracteres (o BCrypt considera apenas os primeiros 72 bytes).
- **Mesma mensagem para e-mail inexistente e senha incorreta**, para não revelar quais e-mails estão cadastrados.
- **O autor do pedido vem do token**, nunca do corpo da requisição.
- **Segredos apenas em variáveis de ambiente.** A aplicação não sobe em produção sem eles, e o segredo do JWT precisa ter pelo menos 256 bits.

**API**
- **Regras de transição no domínio:** ficam no enum `OrderStatus` e são aplicadas por `Order.changeStatus()`, de modo que nenhum código consegue mudar o status sem passar por elas.
- **DTOs (records) separados das entidades**, com mensagens de validação em português e normalização de entrada (e-mail em minúsculas, CEP no formato `00000-000`, UF em maiúsculas).
- **Erros no padrão Problem Details**, com o caminho exato do campo inválido, inclusive em objetos aninhados.

**Frontend**
- **TanStack Query** para cache, estados de carregamento e erro, e sincronização. A lista se atualiza a cada 30 segundos, e a resposta da mudança de status atualiza o cache sem uma nova busca.
- **Busca por número usando `GET /api/orders/{id}`:** a busca e a página de detalhe compartilham a mesma chave de cache, então o detalhe abre sem uma segunda requisição. Um número inexistente mostra o aviso na própria lista.
- **Formulário espelhando o JSON da API:** os erros devolvidos pelo servidor aparecem diretamente no campo correspondente.
- **Total calculado em centavos** no front-end, para evitar erros de ponto flutuante (`0,10 × 3 = 0,30`).
- **Sessão em `localStorage`**, encerrada automaticamente quando o token expira ou quando a API responde `401`. É uma escolha simples para uma API stateless; a alternativa mais resistente a XSS seria um cookie `httpOnly`.

## Deploy

| Componente | Serviço | Configuração |
|---|---|---|
| API | Render (Docker, plano gratuito, região Virginia) | [`render.yaml`](render.yaml) e [`backend/Dockerfile`](backend/Dockerfile) |
| Banco | Neon PostgreSQL (AWS us-east-1) | variáveis `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` |
| Frontend | Vercel, com domínio próprio | [`frontend/vercel.json`](frontend/vercel.json) e variável `VITE_API_URL` |

O Dockerfile usa build em duas etapas, executa a aplicação com um usuário sem privilégios e
ajusta a JVM para os 512 MB da instância gratuita. O CORS libera apenas as origens definidas
em `CORS_ALLOWED_ORIGINS`.

## Próximos passos

- Paginação e filtros na listagem pelo servidor
- Histórico de mudanças de status (quem alterou e quando)
- Refresh token e perfis de acesso (operador, administrador)
- Testes de integração com PostgreSQL real via Testcontainers
- Pipeline de CI com GitHub Actions rodando os testes a cada push
