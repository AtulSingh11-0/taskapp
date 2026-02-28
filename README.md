# TaskApp: Enterprise REST API & SPA

A production-ready full-stack task management system architected for scalability, security, and performance. The backend is powered by Spring Boot 4 and Java 17, exposing a robust RESTful API with strict cookie-based authentication and native header API versioning. The frontend is a modern React SPA built with Vite.

## Table of Contents
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Deliverables](#project-deliverables)
- [Security Model](#security-model)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [API Documentation](#api-documentation)

---

## Architecture & Tech Stack

### Backend Ecosystem
- **Runtime**: Java 17 LTS
- **Framework**: Spring Boot 4.0.3, Spring Security 7, Spring Data JPA
- **Database**: MySQL 8.4 (Connection pooling via HikariCP)
- **Cache**: Redis 7-alpine (Infrastructure-ready)
- **Auth**: JWT (JJWT 0.13.0) + BCrypt Hashing
- **Containerization**: Multi-stage Alpine Docker Build

### Frontend Ecosystem
- **Framework**: React 19 (Vite)
- **State Management**: Context API
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios (with centralized interceptors)
- **Code Formatting**: Prettier

---

## Project Deliverables
- ✅ **Backend Source**: Complete with production-grade structure and deployment scripts.
- ✅ **Secure APIs**: Authentication, Course Management, and Task CRUD functionalities.
- ✅ **Frontend Application**: Fully integrated UI for users and administrators.
- ✅ **API Documentation**: Auto-generated OpenAPI (Swagger) interface.
- ✅ **Scalability & Deployment**: Detailed [SCALABILITY.md](./SCALABILITY.md) provided.

---

## Security Model

Security is a primary focus of this architecture, moving beyond standard token-based authentication to mitigate modern web vulnerabilities:

- **Stateless Sessions**: True `HttpOnly`, `SameSite=Strict` secure cookies for JWT transport, severely mitigating XSS attack vectors.
- **Native CORS**: Explicit Cross-Origin Resource Sharing processing (`CorsConfigurationSource`) wired to defined frontend environments.
- **Header Versioning**: Native Spring WebMvc `X-API-Version` headers ensure backward compatibility and API strictness.
- **RBAC**: Role-Based Access Control (USER / ADMIN) implemented via Spring Security method-level annotations.
- **Data Protection**: BCrypt password hashing (strength 10) and robust Jakarta validation.
- **Error Obfuscation**: Global exception handling prevents stack trace exposures.

---

## Local Development

### Prerequisites
- JDK 17+
- Node.js 18+
- Docker & Docker Compose (Required for 1-click database provisioning)

### 1. Provisioning Infrastructure (Database & Cache)
You can quickly spin up both the required MySQL database and Redis cache using the provided local compose file:
```bash
cd backend
docker compose up -d
```

### 2. Running the Backend API
Edit the `backend/src/main/resources/application.yaml` to point to your local database credentials if not using the default Docker settings.
```bash
cd backend
./mvnw clean spring-boot:run
```
*Note: The application will auto-generate the schema using Hibernate DDL and seed the database with initial users.*

### 3. Running the Frontend SPA
In a separate terminal, install dependencies and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

---


## API Documentation

The REST endpoints are fully documented using OpenAPI 3.1. When the backend is running, the interactive Swagger UI can be accessed at:

- **URL**: `http://localhost:8080/swagger-ui/index.html`
- **Features**: Automatically injects the `X-API-Version` header and seamlessly manages cookie injection for authenticated endpoints.

### Seed Data
For testing the API or Frontend, the following credentials are pre-seeded:

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@taskapp.com` | `Admin@123` |
| **USER** | `john@taskapp.com`  | `User@1234` |
| **USER** | `jane@taskapp.com`  | `User@1234` |
| **USER** | `bob@taskapp.com`   | `User@1234` |
