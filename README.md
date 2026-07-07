# Xebia Assignment Management System (XAMS)

An enterprise-grade, full-stack academic portal designed to automate the assignment lifecycle. It features a stateless **Spring Boot** backend, secure **JWT cookie-based authentication**, **PostgreSQL** persistence, **Redis** caching, and a responsive **React + Vite** dashboard frontend.

---

## 🚀 Key Features

* **Role-Based Workspaces**: Separate dashboards for Teachers (create batches, publish assignments, grade submissions) and Students (view deadlines, download attachments, upload solutions).
* **Stateless Token Authentication**: Implements JSON Web Tokens (JWT) stored in HTTP-Only cookies to secure APIs and manage roles.
* **Cloud File Storage**: Integrates Cloudinary API for secure file uploads.
* **Database Query Caching**: Uses Redis to cache dashboard counts and assignment statuses, reducing database load.
* **Modern React Dashboard**: Responsive layouts with clean UI components, dark-mode toggle, and micro-animations.

---

## 🛠️ Technology Stack

### Backend:
* **Framework**: Spring Boot 3.3.1 (Java 21)
* **Security**: Spring Security & JWT
* **ORM / Database**: Spring Data JPA, Hibernate, PostgreSQL
* **Caching**: Redis
* **File Uploads**: Cloudinary SDK
* **Mapping / Utils**: MapStruct, Lombok

### Frontend:
* **Framework**: React 19 (Vite-based compilation)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **State Management**: Redux Toolkit
* **Forms & Validation**: React Hook Form, Zod
* **HTTP Client**: Axios

---

## ⚡ Quick-Start Guide

### Prerequisiets:
Install **JDK 21**, **Node.js v18+**, **PostgreSQL**, and **Redis**.

### 1. Database Setup
Log in to PostgreSQL and create the database:
```sql
CREATE DATABASE assignment_db;
```

### 2. Run the Backend
1. Open a terminal in `/Backend`.
2. Configure your credentials in `src/main/resources/application.properties`.
3. Run the application:
   ```bash
   mvn clean spring-boot:run
   ```

### 3. Run the Frontend
1. Open a new terminal in `/frontend`.
2. Install Node packages and start the dev server:
   ```bash
   npm install
   ```
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your web browser.

---

## 📖 Comprehensive Documentation Directory

The complete project documentation is organized into 26 detailed chapters located under the `/documentation` directory:

### 1. Project Introduction & Planning
* Chapter 1: [Project Overview](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/01_project_overview.md)
* Chapter 2: [Project Architecture](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/02_project_architecture.md)
* Chapter 3: [Folder Structure Rationale](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/03_folder_structure.md)

### 2. Frontend Specifications
* Chapter 4: [Frontend Code Base Guide](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/04_frontend_documentation.md)
* Chapter 5: [UI & Component Breakdown](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/05_ui_documentation.md)

### 3. Backend Specifications
* Chapter 6: [Backend Package Layout](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/06_backend_documentation.md)
* Chapter 7: [Java Class Details](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/07_java_class_documentation.md)
* Chapter 8: [Spring Boot Framework Usage](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/08_spring_boot_explanation.md)

### 4. Security & Database Design
* Chapter 9: [Authentication & Authorization (JWT)](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/09_auth_and_auth.md)
* Chapter 10: [Database Schema Design](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/10_database_documentation.md)
* Chapter 11: [REST API Specifications](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/11_api_documentation.md)

### 5. Workflows & Core Processes
* Chapter 12: [Core Business Logic Workflows](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/12_business_logic.md)
* Chapter 13: [End-to-End Request Lifecycle](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/13_request_lifecycle.md)
* Chapter 14: [System Error Handling](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/14_error_handling.md)

### 6. Configurations & Technical Details
* Chapter 15: [Configuration Files Analysis](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/15_configuration_files.md)
* Chapter 16: [Security Configurations & Measures](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/16_security.md)
* Chapter 17: [Code Implementation Walkthrough](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/17_code_walkthrough.md)

### 7. Diagnostics, Verification & Operations
* Chapter 18: [UML Diagrams](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/18_uml_diagrams.md)
* Chapter 19: [System Testing Strategy](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/19_testing.md)
* Chapter 20: [Deployment & Environment Setup Guide](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/20_deployment.md)
* Chapter 21: [System Performance Optimizations](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/21_performance.md)

### 8. Guides & Roadmaps
* Chapter 22: [End-User Manual](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/22_user_guide.md)
* Chapter 23: [Developer Contribution Guide](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/23_developer_guide.md)
* Chapter 24: [Future Project Roadmap](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/24_future_enhancements.md)
* Chapter 25: [Repository README Guide](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/25_readme_guide.md)
* Chapter 26: [Viva & Interview Preparation Hub](file:///c:/Rohit/Xebia%20Project/New%20Task/xebia-assignment-management-system/documentation/26_viva_interview_prep.md)

* done!

