# VIE SYSTEM ARCHITECTURE

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│  ┌──────────────────────┬──────────────────┬──────────────────┐ │
│  │  Web Terminal (UI)   │  Dashboard (UI)  │  Code Review UI  │ │
│  │  (xterm.js)          │                  │                  │ │
│  └─────────┬────────────┴────────┬─────────┴────────┬──────────┘ │
│            │                      │                  │             │
└────────────┼──────────────────────┼──────────────────┼─────────────┘
             │                      │                  │
        WebSocket              HTTP / REST API       HTTP / REST API
             │                      │                  │
┌────────────▼──────────────────────▼──────────────────▼─────────────┐
│                      NODE.JS BACKEND SERVER                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  API Layer (Express Routes)                                 │  │
│  │  - /api/auth                                                │  │
│  │  - /api/projects                                            │  │
│  │  - /api/submissions (code reviews)                          │  │
│  │  - /api/deployments                                         │  │
│  │  - /api/terminal (WebSocket)                                │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                 ▲                                  │
│  ┌──────────────────────┬───────┴──────────┬──────────────────┐  │
│  │                      │                  │                  │  │
│  ▼                      ▼                  ▼                  ▼  │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│ │ Auth Service │  │ Project Mgmt  │  │ Review Svc   │  │CI/CD Svc││
│ │ - JWT tokens │  │ - Git ops     │  │ - Submissions│  │- Simulate││
│ │ - RBAC       │  │ - Branches    │  │ - Approvals  │  │- Pipeline││
│ │              │  │ - Commits     │  │              │  │- Stages ││
│ └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Terminal Service (Command Execution)                        │  │
│  │  - Command parser & router                                  │  │
│  │  - Git wrapper (internal)                                   │  │
│  │  - Validation engine                                        │  │
│  │  - Real-time output streaming                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Deploy Service                                              │  │
│  │  - Deployment simulation                                    │  │
│  │  - Status tracking                                          │  │
│  │  - Log aggregation                                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
             │                      │
        File System             Network
             │                      │
┌────────────▼──────────────────────▼─────────────────────────────────┐
│                         PERSISTENT STORAGE                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MONGODB                                                     │  │
│  │  - users                                                     │  │
│  │  - projects                                                  │  │
│  │  - git_repos (metadata)                                      │  │
│  │  - code_submissions                                          │  │
│  │  - reviews                                                   │  │
│  │  - deployments                                               │  │
│  │  - audit_log                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  FILE SYSTEM (Server)                                        │  │
│  │  /repos/<company>/                                           │  │
│  │    └── <project>/                                            │  │
│  │        ├── .git/ (actual git repos)                          │  │
│  │        └── code files                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Code Submission & Review

```
┌──────────────┐
│  Junior Dev  │
└────────┬─────┘
         │ vie push (via web terminal)
         ▼
┌─────────────────────────────────────┐
│  Command Parser (Terminal Service)  │
│  - Validate branch (not main)        │
│  - Check for uncommitted changes     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Rule Engine                        │
│  - Check commit message format      │
│  - Check file naming rules          │
│  - Check for blocked patterns       │
└────────────┬────────────────────────┘
             │ (pass/fail)
         pass│
             ▼
┌─────────────────────────────────────┐
│  Git Operations (server-side)       │
│  - git push origin feature-x        │
│  - Create submission record in DB   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  CI/CD Service                      │
│  - Start pipeline simulation        │
│  - Run tests                        │
│  - Generate report                  │
└────────────┬────────────────────────┘
             │ (pass/fail)
        pass │
             ▼
┌─────────────────────────────────────┐
│  Create Review Request              │
│  - Assign to Senior Dev             │
│  - Notify reviewer                  │
│  - Status: AWAITING_REVIEW          │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Senior Developer Dashboard          │
│  - Sees submission in queue          │
│  - Reviews code diff                 │
│  - Approves or Rejects               │
└────────────┬─────────────────────────┘
         app │reject
             ▼
┌──────────────────────────────────────┐
│  IF REJECTED:                        │
│  - Submission status: REJECTED       │
│  - Comments sent to Junior           │
│  - Junior fixes and re-pushes        │
└──────────────────────────────────────┘
             │ (approval)
             │
         approval
             ▼
┌──────────────────────────────────────┐
│  Manager Approval                    │
│  - Final review                      │
│  - Can approve or reject             │
│  - Status: AWAITING_MANAGER_APPROVAL │
└────────────┬─────────────────────────┘
             │ (approved)
             ▼
┌──────────────────────────────────────┐
│  Merge to Main                       │
│  - git merge feature-x → main        │
│  - Submission status: APPROVED       │
│  - Trigger deployment                │
└──────────────────────────────────────┘
```

---

## Service Responsibilities

### 1. Authentication Service
- User registration and login
- JWT token generation and validation
- Role verification
- Session management

### 2. Project Management Service
- Create/list/delete projects
- Internal git repository initialization
- Branch listing and metadata
- Current state tracking

### 3. Terminal Service
- Parse incoming commands
- Route to appropriate handler
- Execute git operations server-side
- Stream output back to client
- Maintain terminal session state

### 4. Validation & Rule Engine
- Commit message format validation
- File naming conventions
- Blocked keywords/patterns
- Branch protection rules
- Custom validation rules per project

### 5. Code Submission Service
- Record code submissions
- Track status through workflow
- Store diff information
- Manage metadata

### 6. Review Service
- Create review requests
- Track approvals/rejections
- Store comments
- Route to appropriate approver
- Notify relevant parties

### 7. CI/CD Service
- Simulate pipeline stages
- Execute or simulate tests
- Generate reports
- Update status
- Stream logs

### 8. Deployment Service
- Simulate deployment process
- Track deployment status
- Generate deployment logs
- Handle success/failure
- Restrict access (Junior Dev view-only)

---

## Technology Stack

```
Frontend:
  - React (dashboard UI)
  - Xterm.js (web terminal)
  - Axios (HTTP client)
  - WebSocket (terminal communication)

Backend:
  - Node.js + Express
  - MongoDB + Mongoose
  - Nodegit OR child_process for git operations
  - Socket.io for WebSocket
  - JWT for authentication
  - Bcrypt for password hashing

Infrastructure (MVP):
  - Single server (can scale later)
  - File system for git repos
  - MongoDB instance
  
DevOps (MVP):
  - PM2 for process management
  - Environment-based config
```

---

## Security Considerations

1. **Git Operations**: All git commands executed server-side, never exposed to client
2. **RBAC**: Every API call checks user role before executing
3. **Input Validation**: All commands validated before execution
4. **Audit Logging**: All actions logged with user, timestamp, action type
5. **Branch Protection**: Main branch locked from direct pushes
6. **JWT Tokens**: Signed, time-limited, refreshable
7. **Isolated Repos**: Each project has isolated repository
