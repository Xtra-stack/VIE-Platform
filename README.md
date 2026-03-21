# VIE - Virtual Industry Experience

VIE is an industry simulation learning platform that helps learners experience realistic software team workflows.

This project is not a GitHub clone. It is focused on structured learning through role-based collaboration, code submission, review cycles, and progress visibility.

## Description

VIE simulates how engineering teams work in real organizations:

- juniors work on assigned tasks
- seniors review submissions and request improvements
- managers finalize approvals

The platform is designed for learning progression and practical workflow exposure.

## Key Features

- Role-based system: `Admin`, `Manager`, `Senior`, `Junior`
- Task workflow: assign -> submit -> review -> rework -> approve
- Learning-focused task execution and feedback cycles
- Demo Trial Mode for guided exploration
- Coding workspace with file editing and terminal simulation
- Foundations for skill tracking and growth analytics

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Deployment: Render (backend) + Vercel (frontend)

## Project Structure

```text
frontend/
backend/
```

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd VIE
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend runs with:

- `npm install`
- `npm start`

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vie
JWT_SECRET=your-strong-secret
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend.onrender.com
```

## API Configuration

Frontend API calls are configured to use:

`\${import.meta.env.VITE_API_URL}/api/...`

No localhost API URLs are required for deployment.

## Deployment Guide

### Backend on Render

1. Push repository to GitHub.
2. Create a new Web Service in Render.
3. Set Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables:
	- `NODE_ENV=production`
	- `PORT=5000`
	- `MONGO_URI=...`
	- `JWT_SECRET=...`
	- `CLIENT_URL=https://your-frontend.vercel.app`
7. Deploy and verify:
	- `GET https://your-backend.onrender.com/api/health`
	- Expected response: `Server is running`

### Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add environment variable:
	- `VITE_API_URL=https://your-backend.onrender.com`
6. Deploy.

## Connect Frontend + Backend

1. Deploy backend first and copy Render URL.
2. Set `VITE_API_URL` in Vercel to that URL.
3. Set backend `CLIENT_URL` to the Vercel domain.
4. Redeploy both services if environment variables change.

## How to Test Live App

1. Open deployed frontend URL.
2. Try login/register and dashboard navigation.
3. Trigger API-backed flows (tasks, submissions, reviews).
4. Confirm no CORS/network issues in browser dev tools.
5. Verify backend health endpoint is reachable.

## Future Improvements

- Enhanced demo simulation mode coverage
- Deeper skill analytics and insights
- Better performance tracking dashboards

## Author

AJAY

---

For detailed system docs, see: `ARCHITECTURE.md`, `API_SPEC.md`, `DATABASE_SCHEMA.md`, and `CICD_FLOW.md`.
