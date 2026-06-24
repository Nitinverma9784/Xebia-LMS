# Backend API Structure

## Base URL
`/api` (configurable via `NEXT_PUBLIC_API_URL`)

## API Endpoints

### Categories (`/api/categories`)
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/categories/{categoryId}/courses` - Get courses for a specific category
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Courses (`/api/courses`)
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Modules (`/api/modules`)
- `GET /api/modules` - Get all modules
- `GET /api/modules/{id}` - Get module by ID
- `POST /api/modules` - Create new module
- `PUT /api/modules/{id}` - Update module
- `DELETE /api/modules/{id}` - Delete module

### Submodules (`/api/submodules`)
- `GET /api/submodules` - Get all submodules
- `GET /api/submodules/{id}` - Get submodule by ID
- `POST /api/submodules` - Create new submodule
- `PUT /api/submodules/{id}` - Update submodule
- `DELETE /api/submodules/{id}` - Delete submodule

### Contents (`/api/contents`)
- `GET /api/contents` - Get all contents
- `GET /api/contents/{id}` - Get content by ID
- `POST /api/contents` - Create new content
- `PUT /api/contents/{id}` - Update content
- `DELETE /api/contents/{id}` - Delete content

## Data Models

### Category
**Request DTO:**
- `name` (string, required, max 100 chars)
- `icon` (string, optional, max 1000 chars)
- `description` (string, optional)
- `color` (string, optional, max 20 chars)
- `isActive` (boolean, optional)

**Response DTO:**
- `id` (long)
- `name` (string)
- `icon` (string)
- `description` (string)
- `color` (string)
- `isActive` (boolean)
- `courses` (array of CourseResponseDTO, optional)

### Course
**Request DTO:**
- `title` (string, required, max 200 chars)
- `slug` (string, required, max 250 chars)
- `description` (string, optional)
- `shortDescription` (string, optional)
- `level` (string, optional, max 50 chars)
- `language` (string, optional, max 100 chars)
- `duration` (string, optional, max 100 chars)
- `icon` (string, optional, max 1000 chars)
- `thumbnail` (string, optional, max 1000 chars)
- `bannerImage` (string, optional, max 1000 chars)
- `isActive` (boolean, optional)
- `isFeatured` (boolean, optional)
- **SEO Fields:** metaTitle, metaDescription, metaKeywords, canonicalUrl, primaryKeyword, secondaryKeywords, focusKeywords, robots, author, seoCategory, seoTags, ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterTitle, twitterDescription, twitterImage, twitterCard, schemaMarkup, faqSchema, breadcrumbSchema
- **Course Content:** youtubeVideoUrl, previewVideoUrl, learningOutcomes, prerequisites, targetAudience, courseHighlights, careerOpportunities
- **Programmatic SEO:** searchIntent, semanticKeywords, relatedTopics, searchSynonyms
- **FAQ Content:** faqContent
- **Custom Scripts:** customHeadScript, customBodyScript
- **Analytics:** totalViews, totalClicks, ctr, seoScore
- **Flags:** isPublished, allowIndexing, showInSearch
- `categoryId` (long, required)

**Response DTO:**
- All request fields plus:
- `id` (long)
- `category` (CategoryResponseDTO)
- `modules` (array of ModuleResponseDTO)

### Module
**Request DTO:**
- `title` (string, required, max 200 chars)
- `description` (string, optional)
- `moduleOrder` (integer, optional)
- `isActive` (boolean, optional)
- `courseId` (long, required)

**Response DTO:**
- `id` (long)
- `title` (string)
- `description` (string)
- `moduleOrder` (integer)
- `isActive` (boolean)
- `course` (CourseResponseDTO)
- `submodules` (array of SubmoduleResponseDTO)

### Submodule
**Request DTO:**
- `title` (string, required, max 200 chars)
- `description` (string, optional)
- `metaTitle` (string, optional, max 70 chars)
- `metaDescription` (string, optional, max 320 chars)
- `canonicalUrl` (string, optional, max 1000 chars)
- `ogTitle` (string, optional, max 150 chars)
- `ogDescription` (string, optional, max 500 chars)
- `ogImage` (string, optional, max 1000 chars)
- `submoduleOrder` (integer, optional)
- `isActive` (boolean, optional)
- `moduleId` (long, required)
- `slug` (string, required, max 250 chars)

**Response DTO:**
- `id` (long)
- `title` (string)
- `description` (string)
- `metaTitle` (string)
- `metaDescription` (string)
- `canonicalUrl` (string)
- `ogTitle` (string)
- `ogDescription` (string)
- `ogImage` (string)
- `submoduleOrder` (integer)
- `isActive` (boolean)
- `slug` (string)
- `module` (ModuleResponseDTO)
- `contents` (array of ContentResponseDTO)

### Content
**Request DTO:**
- `type` (string, required, max 30 chars)
- `text` (string, optional)
- `code` (string, optional)
- `language` (string, optional, max 50 chars)
- `videoUrl` (string, optional, max 500 chars)
- `imageUrl` (string, optional, max 500 chars)
- `alt` (string, optional, max 200 chars)
- `caption` (string, optional, max 300 chars)
- `title` (string, optional, max 300 chars)
- `headingLevel` (integer, optional)
- `contentOrder` (integer, optional)
- `isActive` (boolean, optional)
- `submoduleId` (long, required)

**Response DTO:**
- `id` (long)
- `type` (string)
- `text` (string)
- `code` (string)
- `language` (string)
- `videoUrl` (string)
- `imageUrl` (string)
- `alt` (string)
- `caption` (string)
- `title` (string)
- `headingLevel` (integer)
- `contentOrder` (integer)
- `isActive` (boolean)
- `submodule` (SubmoduleResponseDTO)

## API Response Format
All endpoints return:
```json
{
  "message": "string",
  "data": <response DTO or array>
}
```

## Frontend Integration Notes

### Current State
- Frontend uses mock data via `useCatalog` hook
- API service layer has been updated with real endpoints in `services/api.js`
- Feature components exist for: Category, Course, Module, Submodule, Content

### Required Changes
1. **Replace mock data with real API calls** - Update `useCatalog` hook to use the new API services
2. **Align form fields** - Update forms to match backend DTO field names (e.g., `isActive` instead of `status`, `categoryId` instead of `category`)
3. **Add SEO fields** - Course forms need extensive SEO fields that are currently missing
4. **Add slug field** - Course and Submodule require slug fields
5. **Update field validations** - Match backend validation rules (max lengths, required fields)
6. **Handle nested relationships** - Backend returns nested objects (category in course, course in module, etc.)
7. **Remove soft delete** - Backend doesn't appear to use soft delete (no deletedAt field)
8. **Update content types** - Content type should match backend enum (text, code, video, image, heading, etc.)

### Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```
(Adjust port based on backend configuration)
