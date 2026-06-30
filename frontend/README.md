# Xebia LMS — Course Catalog Module

Enterprise-grade Course Catalog for the Xebia Learning Management System. Built with **Next.js 15**, **Tailwind CSS**, **React Query**, and **Framer Motion**.

## Features

- **Category Management** — Full CRUD, search, pagination, active/inactive status
- **Course Management** — Thumbnails, tech logos, filters, sorting, duplicate
- **Course Builder Workspace** — 3-panel layout with hierarchy tree, drag-and-drop, inline rename, context menus
- **Module / Submodule / Content** — Complete CRUD with reordering and preview drawer
- **Media Library** — Grid/list views with search and type filters
- **Branding Settings** — White-label company name, colors, logos
- **Mock Data** — 10 categories, 50 courses, 200+ modules, 500+ submodules, 1000+ content items, 120 students

## Getting Started

```bash
npm install
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
services/             Mock data & future API layer
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

Replace `hooks/useCatalog.js` localStorage store with React Query hooks calling your backend. Mock data shapes in `services/mockData.js` mirror a typical LMS entity hierarchy:

```
Category → Course → Module → Submodule → Content
```
