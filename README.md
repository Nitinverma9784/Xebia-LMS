# Xebia LMS — Course Catalog Module

Enterprise-grade Course Catalog for the Xebia Learning Management System. Built with **Next.js 15**, **Tailwind CSS**, **React Query**, and **Framer Motion**.

## Features

- **Category Management** — Full CRUD, search, pagination, active/inactive status
- **Course Management** — Thumbnails, tech logos, filters, sorting, duplicate, comprehensive SEO fields
- **Course Builder Workspace** — 3-panel layout with hierarchy tree, drag-and-drop, inline rename, context menus
- **Module / Submodule / Content** — Complete CRUD with reordering and preview drawer
- **Media Library** — Grid/list views with search and type filters
- **Branding Settings** — White-label company name, colors, logos
- **Backend API Integration** — Full REST API connectivity with proper DTO alignment

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update NEXT_PUBLIC_API_URL in .env.local to point to your backend
# Example: NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/catalog/categories` | Category list & management |
| `/catalog/categories/[id]` | Courses in a category |
| `/catalog/courses` | All courses |
| `/catalog/courses/[id]` | Course Builder workspace |
| `/catalog/media` | Media library |
| `/catalog/branding` | Branding settings |

## Project Structure

```
app/                  Next.js App Router pages
components/           Reusable UI & layout components
features/             Feature modules (category, course, content)
hooks/                React hooks (catalog store, toast)
services/             API service layer
utils/                Helpers & formatters
constants/            Brand colors, enums, config
public/assets/        Static assets
```

## Tech Stack

- Next.js 15 (App Router)
- JavaScript
- Tailwind CSS 3
- TanStack React Query
- Framer Motion
- @dnd-kit (drag & drop)
- Lucide React Icons

## API Integration

The frontend is now fully integrated with the backend API. The API structure is documented in `API_STRUCTURE.md`.

### Data Hierarchy
```
Category → Course → Module → Submodule → Content
```

### API Configuration
- Set `NEXT_PUBLIC_API_URL` in `.env.local` to your backend API base URL
- Default: `http://localhost:8080/api`

### API Endpoints
All CRUD operations are handled through the REST API:
- **Categories**: `/api/categories`
- **Courses**: `/api/courses`
- **Modules**: `/api/modules`
- **Submodules**: `/api/submodules`
- **Contents**: `/api/contents`

See `API_STRUCTURE.md` for complete endpoint documentation and DTO specifications.

### Form Field Alignment
All forms have been updated to match backend DTO specifications:
- **Category**: name, icon, description, color, isActive
- **Course**: Complete SEO fields (metaTitle, metaDescription, ogTitle, twitterCard, etc.), slug, course content fields, programmatic SEO, custom scripts
- **Module**: title, description, moduleOrder, isActive, courseId
- **Submodule**: title, description, slug, SEO fields (metaTitle, metaDescription, canonicalUrl, ogTitle, ogDescription, ogImage), submoduleOrder, isActive
- **Content**: type, text, code, language, videoUrl, imageUrl, alt, caption, title, headingLevel, contentOrder, isActive
