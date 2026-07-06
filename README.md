# Xebia LMS — Student & Teacher Portal

A full-stack Learning Management System (LMS) extension containing a **Teacher Portal** and **Student Portal**, built to match the existing Xebia LMS design system.

## 🚀 Features

### 👨‍🏫 Teacher Portal
- **Dashboard**: Overview cards for Total, Active, Submitted, Pending Assignments, and Students.
- **Assignment Management**: Full CRUD (Create with file upload, Save Draft, Publish, Edit, Delete).
- **Submitted Assignments**: Review submissions, grade marks, provide feedback, and mark as reviewed.
- **Profile**: Manage teacher details and subject info.

### 🎓 Student Portal
- **Dashboard**: Student overview with 5 stat cards, quick actions, and performance summary.
- **Assignments**: Table and Grid view switchers, search by title/subject, filters, due date countdown timer.
- **Assignment Detail & Submission**: Drag-and-drop file upload, upload progress indicator, score breakdown, and teacher feedback display.
- **Learning Progress**: Subject-wise performance tracking with percentage bars.
- **Profile**: Student information and enrollment number display.

## 🛠️ Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS v3 + Lucide Icons + React Router v6
- **Backend**: Node.js + Express + TypeScript + Prisma ORM + JWT Auth
- **Database**: SQLite (local dev) / PostgreSQL compatible
- **Storage**: Cloudinary / Local Multer fallback

## 🏁 Quick Start

### 1. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node src/seed.ts
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Pre-seeded Credentials
- **Teacher**: `teacher@xebia.com` / `password123`
- **Student**: `student@xebia.com` / `password123`
