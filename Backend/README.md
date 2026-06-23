# LMS Backend

A production-ready Spring Boot REST API for a Learning Management System (LMS). Built using clean architecture patterns with Spring Data JPA and PostgreSQL.

## Technologies Used

- **Java 17 / 21**
- **Spring Boot 3.3.0**
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**
- **Maven**

---

## Project Structure

```text
com.geeknito.LMS_backend
│
├── LMSBackendApplication.java     # Entry Point
│
├── controller                      # REST Controllers
│   ├── CategoryController.java
│   ├── CourseController.java
│   ├── ModuleController.java
│   ├── SubmoduleController.java
│   └── ContentController.java
│
├── entity.learning                 # JPA Entities
│   ├── CategoryEntity.java
│   ├── CourseEntity.java
│   ├── ModuleEntity.java
│   ├── SubmoduleEntity.java
│   └── ContentEntity.java
│
├── repository                      # JPA Repositories
│   ├── CategoryRepository.java
│   ├── CourseRepository.java
│   ├── ModuleRepository.java
│   ├── SubmoduleRepository.java
│   └── ContentRepository.java
│
├── service                         # Service Interfaces
│   ├── CategoryService.java
│   ├── CourseService.java
│   ├── ModuleService.java
│   ├── SubmoduleService.java
│   └── ContentService.java
│
├── serviceImpl                     # Service Implementations
│   ├── CategoryServiceImpl.java
│   ├── CourseServiceImpl.java
│   ├── ModuleServiceImpl.java
│   ├── SubmoduleServiceImpl.java
│   └── ContentServiceImpl.java
│
├── dto                             # Request DTOs
│   ├── CategoryRequest.java
│   ├── CourseRequest.java
│   ├── ModuleRequest.java
│   ├── SubmoduleRequest.java
│   └── ContentRequest.java
│
├── exception                       # Global Exception Handlers
│   ├── ResourceNotFoundException.java
│   └── GlobalExceptionHandler.java
│
└── response                        # Standard Response Structure
    └── ApiResponse.java
```

---

## API Endpoints

### Category
- `POST   /api/categories`      - Create Category
- `GET    /api/categories`      - Get All Categories
- `GET    /api/categories/{id}` - Get Category by ID
- `PUT    /api/categories/{id}` - Update Category
- `DELETE /api/categories/{id}` - Delete Category

### Course
- `POST   /api/courses`      - Create Course
- `GET    /api/courses`      - Get All Courses
- `GET    /api/courses/{id}` - Get Course by ID
- `PUT    /api/courses/{id}` - Update Course
- `DELETE /api/courses/{id}` - Delete Course

### Module
- `POST   /api/modules`      - Create Module
- `GET    /api/modules`      - Get All Modules
- `GET    /api/modules/{id}` - Get Module by ID
- `PUT    /api/modules/{id}` - Update Module
- `DELETE /api/modules/{id}` - Delete Module

### Submodule
- `POST   /api/submodules`      - Create Submodule
- `GET    /api/submodules`      - Get All Submodules
- `GET    /api/submodules/{id}` - Get Submodule by ID
- `PUT    /api/submodules/{id}` - Update Submodule
- `DELETE /api/submodules/{id}` - Delete Submodule

### Content
- `POST   /api/contents`      - Create Content
- `GET    /api/contents`      - Get All Contents
- `GET    /api/contents/{id}` - Get Content by ID
- `PUT    /api/contents/{id}` - Update Content
- `DELETE /api/contents/{id}` - Delete Content

---

## Setup & Running

1. **Database Setup**:
   Ensure PostgreSQL is running and database named `lms` is created.
   Update credentials in `src/main/resources/application.properties` if needed.

2. **Build and Run**:
   If Maven is installed locally:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   Or open the project in your favorite IDE (IntelliJ IDEA, Eclipse, VS Code) which will automatically resolve all dependencies via `pom.xml`.
