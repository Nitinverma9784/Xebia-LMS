# LMS — Learning Management System

A full-stack Learning Management System with a Spring Boot backend and React (Vite) frontend.

---

## Project Structure

```
├── backend/   # Spring Boot (Java 17, Maven)
└── frontend/  # React + Vite + Tailwind CSS
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL (optional — defaults to H2 in-memory for dev)

---

### Backend Setup

```bash
cd backend
cp .env.example .env       # fill in your values
```

**Running in dev mode (H2 in-memory — no database needed):**

```bash
./mvnw spring-boot:run
```

**Running with PostgreSQL:**

Set `SPRING_PROFILES_ACTIVE=postgres` in your `.env` and fill in the DB credentials, then:

```bash
./mvnw spring-boot:run
```

The backend starts on `http://localhost:8082`.

---

### Frontend Setup

```bash
cd frontend
cp .env.example .env       # adjust VITE_API_URL if needed
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` and proxies `/api` requests to the backend.

---

### Docker (Backend)

```bash
cd backend
docker build -t lms-backend .
docker run -p 8082:8082 \
  -e SPRING_PROFILES_ACTIVE=postgres \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/lms_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  lms-backend
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required for postgres |
|---|---|---|
| `PORT` | Server port (default `8082`) | No |
| `SPRING_PROFILES_ACTIVE` | `dev` or `postgres` | No |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL | Yes |
| `SPRING_DATASOURCE_USERNAME` | DB username | Yes |
| `SPRING_DATASOURCE_PASSWORD` | DB password | Yes |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default `/api`) |

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a Pull Request
