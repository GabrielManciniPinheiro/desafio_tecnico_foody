# Foody — Gestão de Pedidos

Sistema de gestão de pedidos de delivery, com API REST em Java + Spring Boot e front-end em React.

## Estrutura

```
backend/   API REST (Java 21, Spring Boot 4)
```

## Rodando o backend

Pré-requisito: JDK 21 ou superior.

```bash
cd backend
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. Para verificar: `GET /actuator/health`.

### Banco de dados

Por padrão a aplicação usa H2 em memória (perfil `local`), sem nenhuma configuração.
Para usar PostgreSQL, copie `backend/.env.example` para `backend/.env`, preencha os
dados de conexão e o segredo do JWT (`JWT_SECRET`) e rode com o perfil `prod`:

```bash
./mvnw spring-boot:run "-Dspring-boot.run.profiles=prod"
```

As tabelas são criadas pelo Flyway a partir das migrations em
`backend/src/main/resources/db/migration`.
