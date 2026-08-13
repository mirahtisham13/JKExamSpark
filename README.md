# JKExamSpark

A production-quality platform for JKSSB aspirants to prepare for exams, take mock quizzes, track real exam scores, and estimate cutoffs based on student-submitted actual marks.

## Overview

The platform uses a modern, high-performance tech stack:
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Zustand, React Query
- **Backend**: FastAPI, Async SQLAlchemy 2.0, PostgreSQL
- **Infrastructure**: Vercel (Frontend), Railway (Backend & DB), Supabase (File Storage)

## Cost-Effective Deployment Strategy (For GitHub Student Developer Pack)

You can deploy this entire application completely for **FREE** using the tools in your GitHub Student Developer Pack and generous free tiers.

### 1. Database (Railway & Supabase)
- **Database (PostgreSQL)**: Use **Railway**. Since you have the GitHub Student Developer Pack, you can get free credits on Railway. Deploy a PostgreSQL database on Railway in a single click.
- **File Storage**: Use **Supabase Storage**. Supabase offers a very generous free tier (1GB storage, 2GB bandwidth). For PDFs and images, this is more than enough for thousands of files. 

### 2. Backend (FastAPI)
- Deploy the backend on **Railway** alongside your database.
- Create a new project, connect your GitHub repository, and point it to the `/backend` folder.
- Railway will automatically detect the `Dockerfile` and build it.
- **Cost**: Uses your GitHub Student Pack credits.

### 3. Frontend (Next.js)
- Deploy the frontend on **Vercel**.
- Connect your GitHub repository, set the root directory to `/frontend`.
- Vercel provides top-tier performance for Next.js out of the box.
- **Cost**: 100% Free on their Hobby tier.

---

## Local Development Setup

### 1. Prerequisites
- Docker & Docker Compose (for local database)
- Node.js 20+
- Python 3.11+

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up the python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the local PostgreSQL database using Docker:
   ```bash
   docker-compose up -d
   ```
5. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the .env file with your local database URL: postgresql+asyncpg://postgres:postgres@localhost:5432/jkexamspark
   ```
6. Run database migrations:
   ```bash
   alembic upgrade head
   ```
7. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API docs will be available at: http://localhost:8000/docs

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Ensure NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at: http://localhost:3000

## Core Logic Principles

- **Separation of Scores**: Quiz scores (mock tests) and actual JKSSB exam scores are handled by entirely different endpoints, services, and models.
- **Ranking Engine**: Rankings and Cutoff Predictions are calculated **exclusively** using actual exam score submissions to ensure high fidelity estimates.
- **Privacy First**: Usernames on the public ranking leaderboards are masked for privacy (e.g., `rah***i`).

## Author
Developed as the Lead Software Architect.
