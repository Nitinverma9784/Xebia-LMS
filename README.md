# Xebia LMS — Learning Management System

A full-stack Learning Management System (LMS) with a Spring Boot backend, PostgreSQL database, Cloudinary media storage, and a React + Vite frontend.

---

## Project Architecture

```
├── backend/   # Spring Boot Application (Java 17, Maven)
├── frontend/  # React + Vite Client Application (Tailwind CSS, HSL Theming)
└── docs/      # Module Reference & Flow Documentation
```

---

## 📖 Module Reference Documentation

Detailed architectural overviews, database fields, REST API contracts, and frontend-to-backend request data flows are documented separately for each module:

*   **Category Module:** docs/Category_Documentation.md (Database fields, category cards rendering, dashboard logic, creation/edition flows, and delete triggers).
*   **Course Module:** docs/Course_Documentation.md (Course specifications, programmatic SEO attributes, and course creation pipelines).
*   **Curriculum Module:** docs/Curriculum_Documentation.md (Module creation, Submodule customization, and Content block uploads like PDF/PPT/Code/Video).

---

## 🛠️ Tech Stack & Key Features

- **Spring Boot Backend**:
  - Java 17, Maven 3.9+
  - PostgreSQL integration for active database storage.
  - H2 In-Memory database option for lightweight dev profiling.
  - Integration with Cloudinary for fast and secure file/media uploads.
  - Custom file size properties allowing uploads up to **50MB**.
- **React Frontend**:
  - Vite for extremely fast builds and HMR.
  - Tailwind CSS for modern, premium styling.
  - Custom design tokens, dark mode toggle, and HSL palettes matching the Xebia brand.
- **Curriculum Builder**:
  - Interactive structure builder (Categories ➔ Courses ➔ Modules ➔ Submodules ➔ Content Blocks).
  - 9 rich content block types: **Heading, Text, Callout, Code, Video, PDF, PPT, Image, and Table**.
  - Dynamic page/slide counts for PDF & PPT files with direct Cloudinary storage sync.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Java 17+**
- **Maven 3.9+**
- **Node.js 18+**
- **PostgreSQL** (running locally or remotely)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

3. Open the `.env` file and configure your working variables:
   ```env
   # Server Port
   PORT=8082

   # Database Profile (dev/postgres)
   SPRING_PROFILES_ACTIVE=postgres

   # PostgreSQL Configuration
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/lms
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=nitinverma

   # Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME=dnplvm1es
   CLOUDINARY_API_KEY=658889419438443
   CLOUDINARY_API_SECRET=b1YxF7d9kO3UI6rSXDqGXJHNGn8
   ```

4. Build and run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend API will start on **`http://localhost:8082`**.

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Configure your API endpoint:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8082/api
   ```

4. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
   The frontend web application will start on **`http://localhost:5173`**.

---

## 🛡️ Backend Environment Variable Details (`backend/.env`)

| Variable | Description | Default / Example Value | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Local server port for API calls | `8082` | No |
| `SPRING_PROFILES_ACTIVE` | Active profile: `dev` (H2 DB) or `postgres` | `postgres` | Yes |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC Connection URL | `jdbc:postgresql://localhost:5433/lms` | Yes (for postgres) |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL User Username | `postgres` | Yes (for postgres) |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL User Password | `nitinverma` | Yes (for postgres) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Storage Account Name | `dnplvm1es` | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `658889419438443` | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret Token | `b1YxF7d9kO3UI6rSXDqGXJHNGn8` | Yes |
