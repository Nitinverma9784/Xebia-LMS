# Xebia LMS — Enterprise Learning Management System

Full-stack LMS aligned with the enterprise brief:

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js (App Router), JavaScript, Tailwind CSS, React Query, NextAuth |
| **Backend** | Spring Boot 3.3, Spring Data JPA, Spring Security (method-level), Resilience4j |
| **Infrastructure** | Spring Cloud Gateway, Eureka, Spring Cloud Config |

## Architecture

```
Browser (Next.js :3000)
        │
        ▼
API Gateway (:8080)  ──►  Eureka (:8761)
        │
        ▼
LMS Service (:8081)  ◄──  Config Server (:8888)
        │
        ▼
   PostgreSQL / H2
```

All API traffic from the frontend goes to **`http://localhost:8080/api`** (gateway), which routes to the `lms-service` via Eureka load balancing.

## Prerequisites

- **Java 17+** and **Maven 3.9+**
- **Node.js 20+**
- **PostgreSQL** (optional — use H2 profile for local dev without Postgres)

## Environment setup

Before running, copy the example env files and set your secrets locally (never commit `.env` or `.env.local`):

```bash
# Frontend (required)
cp frontend/.env.local.example frontend/.env.local

# Backend (optional — env vars can also be exported in the shell)
cp Backend/.env.example Backend/.env
```

Generate strong secrets for production:
```bash
# Linux/macOS
openssl rand -base64 32
```

## Quick start (recommended: H2 in-memory DB)

Start services **in this order** (separate terminals):

### 1. Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
```

### 2. Config Server
```bash
cd config-server
mvn spring-boot:run
```

### 3. LMS Service (H2 profile — no PostgreSQL required)
```bash
cd Backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### 4. API Gateway
```bash
cd api-gateway
mvn spring-boot:run
```

### 5. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # if needed
npm install
npm run dev
```

Open **http://localhost:3000**

## PostgreSQL setup (production-like)

1. Create database: `CREATE DATABASE lms;`
2. Set environment variables:
   ```bash
   set DB_URL=jdbc:postgresql://localhost:5432/lms
   set DB_USERNAME=postgres
   set DB_PASSWORD=yourpassword
   ```
3. Run LMS service without `h2` profile:
   ```bash
   cd Backend
   mvn spring-boot:run
   ```

## Demo accounts

| Email | Password | Role |
|-------|----------|------|
| admin@xebia.com | Password123! | ADMIN |
| instructor@xebia.com | Password123! | INSTRUCTOR |
| student@xebia.com | Password123! | STUDENT |

## API endpoints (via gateway)

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/courses` | Public (read) |
| POST | `/api/courses` | ADMIN, INSTRUCTOR |
| DELETE | `/api/courses/{id}` | ADMIN |

See `Backend/README.md` for full CRUD API documentation.

## Frontend pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/courses` | Course catalog (React Query) |
| `/courses/[id]` | Course detail |
| `/login` | NextAuth credentials + optional Google SSO |
| `/dashboard` | Protected user dashboard |

## Optional Google SSO

Set in `frontend/.env.local`:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Build all backend modules

From project root:
```bash
mvn clean install
```

## Service ports

| Service | Port |
|---------|------|
| Frontend | 3000 |
| API Gateway | 8080 |
| LMS Service | 8081 |
| Config Server | 8888 |
| Eureka | 8761 |

## Notes

- The legacy `Pro/Pro` folder (React + Node/Express) is separate and not used by this LMS stack.
- Method-level security uses `@PreAuthorize` on write endpoints.
- Resilience4j circuit breaker is applied to `CourseService.getAll()` with a fallback.
- Eureka is used for service discovery (Consul can be swapped in production).

## Git push checklist

1. Copy env templates locally (not committed):
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   cp Backend/.env.example Backend/.env   # optional
   ```
2. Stage and commit:
   ```bash
   git add .
   git status   # confirm no .env.local, target/, or node_modules/
   git commit -m "Add enterprise LMS stack with Next.js frontend and Spring Cloud services"
   git push -u origin Demo
   ```

**Never commit:** `.env`, `.env.local`, `Backend/target/`, `frontend/node_modules/`, `frontend/.next/`
