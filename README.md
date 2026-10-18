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
