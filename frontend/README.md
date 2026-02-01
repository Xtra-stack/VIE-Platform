# VIE Frontend - Role-Based Dashboard

A minimal React frontend demonstrating how real company workflows operate through a role-based submission and code review system.

## Overview

This frontend mirrors a typical software development company's workflow:

1. **Junior Developers** submit code changes for review
2. **Senior Developers** review the code, approve or request changes
3. **Managers** give final approval before deployment

The entire system enforces role-based access control (RBAC) at both frontend and backend levels, ensuring users can only access and perform actions appropriate for their role.

## Role Separation

### Junior Developer Dashboard
- **Can**: Submit code for review, view own submission status
- **Cannot**: Review or approve other submissions, give final approval
- **Workflow**: Submit → Wait for Senior Review → Monitor status

### Senior Developer Dashboard
- **Can**: Review pending submissions, approve or request changes
- **Cannot**: Submit code, give final approval (Manager only)
- **Workflow**: View pending reviews → Provide feedback → Approve or request changes → Escalate to Manager

### Manager Dashboard
- **Can**: Give final approval after senior review, reject submissions
- **Cannot**: Submit code, do initial code review
- **Workflow**: View senior-approved submissions → Make deployment decision → Approve for production or reject

## How It Demonstrates Real Company Workflow

### 30-Second Recruiter View
"VIE simulates a real development company's submission workflow. Junior devs submit code, seniors review it, and managers approve it. Users log in with their role, see only relevant actions, and the backend enforces all rules. It's a realistic, working model of how actual teams manage code quality."

### Why This Matters in an Interview
- **RBAC Mastery**: Shows understanding of role-based access patterns used in enterprise systems
- **Frontend + Backend Integration**: Demonstrates full-stack thinking, not just UI
- **Real-World Constraints**: Implements workflow sequencing (can't skip steps), state management, and error handling
- **Security-First Design**: JWT tokens, role-based permissions, and proper error responses

## Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **API Client**: Native `fetch` API
- **Styling**: Plain CSS (no UI library - focuses on logic)
- **Auth**: JWT token in localStorage, decoded client-side

## Project Structure

```
frontend/
├── src/
│   ├── auth/
│   │   └── LoginPage.jsx         # Login form with demo credentials
│   ├── dashboards/
│   │   ├── JuniorDashboard.jsx   # Submission creation and status tracking
│   │   ├── SeniorDashboard.jsx   # Code review interface
│   │   └── ManagerDashboard.jsx  # Final approval interface
│   ├── services/
│   │   └── api.js                # API client functions (wraps fetch)
│   ├── utils/
│   │   └── auth.js               # JWT decode, token storage, role checks
│   ├── App.jsx                   # Router and protected routes
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── package.json
├── vite.config.js
└── index.html
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:3000`
- Database seeded with demo data

### Steps

1. Install dependencies:
```bash
npm install
```

2. Start dev server:
```bash
npm run dev
```

3. Open `http://localhost:5173` in browser

4. Login with demo credentials:
   - Manager: `manager1 / password123`
   - Senior: `senior1 / password123`
   - Junior: `junior1 / password123`

## API Integration

The frontend communicates with the backend using the same `/api` and `/auth` routes:

- `POST /auth/login` - Authenticate user, get JWT
- `GET /api/projects` - Fetch projects (junior perspective)
- `POST /api/submissions` - Create code submission (junior only)
- `GET /api/submissions` - List submissions
- `GET /api/reviews` - Get pending reviews for user
- `POST /api/reviews/:id/approve` - Senior approves code
- `POST /api/reviews/:id/reject` - Senior requests changes
- `POST /api/reviews/:id/manager/approve` - Manager approves
- `POST /api/reviews/:id/manager/reject` - Manager rejects

All requests include JWT in `Authorization: Bearer <token>` header.

## Security & RBAC

### Frontend Enforcement
- `<ProtectedRoute>` wrapper checks JWT before rendering dashboards
- Role-based component rendering (show/hide based on user role)
- UI buttons hidden for unauthorized actions

### Backend Enforcement (Real Security)
- `/api/reviews/:id/approve` returns 403 if user is not SENIOR
- `/api/submissions` returns 403 if user is not JUNIOR
- `/api/reviews/:id/manager/approve` returns 403 if user is not MANAGER
- Invalid/expired JWT returns 401

> **Important**: Frontend hiding is for UX only. Backend RBAC middleware provides actual security.

## Demo Workflow

1. **Login as Junior** → Submit code on "Demo Web App" project
2. **Login as Senior** → See pending review, provide feedback, approve
3. **Login as Manager** → See senior-approved submission, give final approval
4. **Result**: Submission status progresses through workflow states

## Error Handling

- Invalid credentials → "Login failed" message
- Wrong role access → "Forbidden" (403) → User stays on dashboard
- Network errors → Displayed as alert
- Missing project/submission → "Not found" error

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder. Deploy to any static host.

## Interview Talking Points

1. **Frontend Architecture**: Show how the router protects pages, how role-based rendering works
2. **State Management**: Explain useState/useEffect patterns for loading and managing submissions
3. **API Integration**: Walk through how login stores JWT, how subsequent calls use token
4. **RBAC Design**: Explain why frontend RBAC is UX + why backend RBAC is security
5. **Testing Approach**: Demo the three roles, show how workflow progresses
6. **Real-World Parallel**: Compare to Jira (sprints), GitHub (PRs), GitLab (approvals)
