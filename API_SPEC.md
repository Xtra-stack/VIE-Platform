# VIE API SPECIFICATION

## API Overview

- **Base URL**: `https://vie-backend.local` (or configured server)
- **Auth**: JWT Bearer tokens in Authorization header
- **Request/Response**: JSON
- **WebSocket**: For terminal and real-time updates

---

## Authentication Endpoints

### POST /api/auth/register

**Request:**
```json
{
  "username": "ajay.patel",
  "email": "ajay@acmecorp.com",
  "password": "SecurePassword123!",
  "fullName": "Ajay Patel",
  "role": "JUNIOR_DEV"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": "user_123",
    "username": "ajay.patel",
    "email": "ajay@acmecorp.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/login

**Request:**
```json
{
  "username": "ajay.patel",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "user_123",
      "username": "ajay.patel",
      "fullName": "Ajay Patel",
      "role": "JUNIOR_DEV",
      "email": "ajay@acmecorp.com"
    }
  }
}
```

---

### POST /api/auth/logout

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/refresh

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Project Endpoints

### GET /api/projects

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_123",
        "name": "Backend API",
        "slug": "backend-api",
        "description": "Core REST API service",
        "role": "DEVELOPER",
        "members": 5,
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ]
  }
}
```

---

### GET /api/projects/:projectId

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "proj_123",
    "name": "Backend API",
    "slug": "backend-api",
    "description": "Core REST API service",
    "repositoryPath": "/repos/acme-corp/backend-api",
    "mainBranch": "main",
    "members": [
      {
        "userId": "user_123",
        "username": "ajay.patel",
        "role": "DEVELOPER",
        "joinedAt": "2024-12-01T10:00:00Z"
      }
    ],
    "validationRules": {
      "commitMessageFormat": "Min 10 characters",
      "blockedKeywords": ["TODO", "FIXME", "WIP"],
      "branchProtection": {
        "mainBranchLocked": true,
        "requireReview": true
      }
    },
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

---

### POST /api/projects

**Request:**
```json
{
  "name": "Mobile App",
  "slug": "mobile-app",
  "description": "iOS/Android client application",
  "mainBranch": "main"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "proj_124",
    "name": "Mobile App",
    "slug": "mobile-app",
    "createdAt": "2025-01-30T14:00:00Z"
  }
}
```

---

## Branch Endpoints

### GET /api/projects/:projectId/branches

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "name": "main",
        "isProtected": true,
        "lastCommit": {
          "hash": "abc123",
          "message": "Release v1.2.0",
          "author": "John Smith",
          "timestamp": "2025-01-30T10:00:00Z"
        },
        "createdAt": "2024-12-01T10:00:00Z"
      },
      {
        "name": "feature-login",
        "isProtected": false,
        "lastCommit": {
          "hash": "def456",
          "message": "Add OAuth2 integration",
          "author": "Ajay Patel",
          "timestamp": "2025-01-30T14:30:00Z"
        },
        "createdAt": "2025-01-20T14:30:00Z"
      }
    ],
    "currentBranch": "feature-login"
  }
}
```

---

### POST /api/projects/:projectId/branches

**Request:**
```json
{
  "name": "feature-user-dashboard",
  "basedOn": "main"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "name": "feature-user-dashboard",
    "basedOn": "main",
    "createdAt": "2025-01-30T15:00:00Z"
  }
}
```

---

### DELETE /api/projects/:projectId/branches/:branchName

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

---

## Code Submission Endpoints

### GET /api/projects/:projectId/submissions

**Query Params:**
- `status`: SUBMITTED|CI_RUNNING|AWAITING_REVIEW|APPROVED|REJECTED|MERGED
- `submittedBy`: Filter by user
- `limit`: 10 (default)
- `offset`: 0 (default)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "sub_789",
        "branch": "feature-login",
        "title": "Add OAuth2 login flow",
        "status": "AWAITING_REVIEW",
        "submittedBy": {
          "userId": "user_123",
          "username": "ajay.patel",
          "fullName": "Ajay Patel"
        },
        "submittedAt": "2025-01-30T14:22:00Z",
        "ciStatus": "PASSED",
        "reviewStatus": "IN_PROGRESS",
        "filesChanged": 5,
        "additions": 234,
        "deletions": 45
      }
    ],
    "total": 1,
    "offset": 0,
    "limit": 10
  }
}
```

---

### POST /api/projects/:projectId/submissions

**Request:**
```json
{
  "branch": "feature-login",
  "title": "Add OAuth2 login flow",
  "description": "Implements OAuth2 authentication for user login"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Code submitted for review",
  "data": {
    "id": "sub_789",
    "status": "CI_RUNNING",
    "branch": "feature-login",
    "message": "Your CI pipeline has started. This may take a few minutes...",
    "ciPipelineId": "pipe_456"
  }
}
```

---

### GET /api/projects/:projectId/submissions/:submissionId

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "sub_789",
    "branch": "feature-login",
    "targetBranch": "main",
    "title": "Add OAuth2 login flow",
    "description": "Implements OAuth2 authentication",
    "status": "AWAITING_REVIEW",
    "submittedBy": {
      "userId": "user_123",
      "username": "ajay.patel",
      "fullName": "Ajay Patel"
    },
    "submittedAt": "2025-01-30T14:22:00Z",
    "commits": [
      {
        "hash": "abc123",
        "message": "Add OAuth2 login flow",
        "author": "Ajay Patel",
        "timestamp": "2025-01-30T14:20:00Z",
        "files": {
          "added": ["src/auth/oauth.js"],
          "modified": ["src/user.js"],
          "deleted": []
        }
      }
    ],
    "ciPipeline": {
      "status": "PASSED",
      "startedAt": "2025-01-30T14:22:00Z",
      "completedAt": "2025-01-30T14:35:00Z",
      "duration": "13m",
      "stages": [
        {
          "name": "Build",
          "status": "PASSED",
          "duration": "5m",
          "logs": "..."
        },
        {
          "name": "Tests",
          "status": "PASSED",
          "duration": "8m",
          "testResults": {
            "total": 234,
            "passed": 234,
            "failed": 0
          },
          "logs": "..."
        }
      ]
    },
    "reviews": [
      {
        "reviewerId": "user_456",
        "reviewer": {
          "username": "schen",
          "fullName": "Sarah Chen"
        },
        "reviewerRole": "SENIOR_DEV",
        "status": "IN_PROGRESS",
        "requestedAt": "2025-01-30T14:35:00Z",
        "comments": [
          {
            "author": "Sarah Chen",
            "text": "Good implementation, just need error handling for edge cases",
            "createdAt": "2025-01-30T15:00:00Z",
            "file": "src/auth/oauth.js",
            "lineNumber": 45
          }
        ]
      }
    ],
    "diffUrl": "/api/projects/proj_123/submissions/sub_789/diff",
    "filesChanged": 5,
    "additions": 234,
    "deletions": 45
  }
}
```

---

### GET /api/projects/:projectId/submissions/:submissionId/diff

**Query Params:**
- `file`: Filter to specific file (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "file": "src/auth/oauth.js",
        "status": "added",
        "additions": 150,
        "deletions": 0,
        "patch": "--- /dev/null\n+++ src/auth/oauth.js\n@@ -0,0 +1,150 @@\n..."
      },
      {
        "file": "src/user.js",
        "status": "modified",
        "additions": 84,
        "deletions": 45,
        "patch": "--- src/user.js\n+++ src/user.js\n@@ -10,5 +10,5 @@\n..."
      }
    ]
  }
}
```

---

## Review Endpoints

### GET /api/reviews

**Query Params:**
- `status`: REQUESTED|IN_PROGRESS|APPROVED|REJECTED
- `reviewerId`: Filter by reviewer
- `limit`: 10 (default)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_123",
        "submissionId": "sub_789",
        "projectId": "proj_123",
        "submittedBy": {
          "userId": "user_123",
          "username": "ajay.patel",
          "fullName": "Ajay Patel"
        },
        "branch": "feature-login",
        "title": "Add OAuth2 login flow",
        "status": "REQUESTED",
        "requestedAt": "2025-01-30T14:35:00Z",
        "ciStatus": "PASSED"
      }
    ],
    "total": 1
  }
}
```

---

### POST /api/reviews/:submissionId/approve

**Request:**
```json
{
  "comment": "Looks good, great implementation!",
  "approved": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Submission approved successfully",
  "data": {
    "submissionId": "sub_789",
    "status": "REVIEWER_APPROVED",
    "nextStep": "Waiting for Manager final approval",
    "approvedAt": "2025-01-30T16:45:00Z"
  }
}
```

---

### POST /api/reviews/:submissionId/reject

**Request:**
```json
{
  "reason": "Please add error handling for OAuth failures",
  "inlineComments": [
    {
      "file": "src/auth/oauth.js",
      "lineNumber": 45,
      "comment": "Need try-catch block here"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Submission rejected",
  "data": {
    "submissionId": "sub_789",
    "status": "REVIEWER_REJECTED",
    "reason": "Please add error handling for OAuth failures",
    "rejectedAt": "2025-01-30T16:50:00Z",
    "nextStep": "Developer will receive notification and can re-submit after fixing"
  }
}
```

---

## Deployment Endpoints

### GET /api/deployments

**Query Params:**
- `projectId`: Filter by project
- `status`: QUEUED|INITIALIZING|DEPLOYING|SUCCESS|FAILED
- `environment`: STAGING|PRODUCTION
- `limit`: 10

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deployments": [
      {
        "id": "dep_456",
        "projectId": "proj_123",
        "submissionId": "sub_789",
        "environment": "STAGING",
        "status": "DEPLOYING",
        "progress": 65,
        "startedAt": "2025-01-30T17:00:00Z",
        "currentStage": "Running migrations",
        "approvedBy": {
          "userId": "user_789",
          "username": "manager123",
          "fullName": "Manager Name"
        }
      }
    ],
    "total": 1
  }
}
```

---

### POST /api/projects/:projectId/submissions/:submissionId/deploy

**Headers:**
```
Authorization: Bearer <token>
X-User-Role: MANAGER (required)
```

**Request:**
```json
{
  "environment": "STAGING",
  "autoDeployToProduction": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Deployment started",
  "data": {
    "deploymentId": "dep_456",
    "status": "INITIALIZING",
    "environment": "STAGING",
    "message": "Deployment pipeline has started. Check progress below.",
    "estimatedDuration": "15 minutes"
  }
}
```

---

### GET /api/deployments/:deploymentId

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "dep_456",
    "projectId": "proj_123",
    "submissionId": "sub_789",
    "environment": "STAGING",
    "status": "DEPLOYING",
    "progress": 65,
    "currentStage": "Running migrations",
    "startedAt": "2025-01-30T17:00:00Z",
    "stages": [
      {
        "name": "Pre-deploy checks",
        "status": "COMPLETED",
        "startedAt": "2025-01-30T17:00:00Z",
        "completedAt": "2025-01-30T17:02:00Z",
        "duration": "2m",
        "logs": "All pre-deployment checks passed"
      },
      {
        "name": "Database migration",
        "status": "IN_PROGRESS",
        "startedAt": "2025-01-30T17:02:00Z",
        "estimatedDuration": "8m",
        "logs": "Running migration: add_user_profiles_table.js...\nMigration complete"
      },
      {
        "name": "Service deployment",
        "status": "PENDING",
        "estimatedDuration": "5m"
      },
      {
        "name": "Smoke tests",
        "status": "PENDING",
        "estimatedDuration": "3m"
      }
    ]
  }
}
```

---

### WebSocket /ws/deployments/:deploymentId

Real-time deployment updates via WebSocket:

**Message:**
```json
{
  "type": "STAGE_STARTED",
  "stage": "Database migration",
  "timestamp": "2025-01-30T17:02:00Z"
}
```

```json
{
  "type": "STAGE_COMPLETED",
  "stage": "Database migration",
  "duration": "8m 15s",
  "timestamp": "2025-01-30T17:10:15Z"
}
```

```json
{
  "type": "LOG_LINE",
  "message": "Running migration: add_user_profiles_table.js...",
  "level": "INFO",
  "timestamp": "2025-01-30T17:02:15Z"
}
```

```json
{
  "type": "DEPLOYMENT_COMPLETE",
  "status": "SUCCESS",
  "duration": "15m 30s",
  "timestamp": "2025-01-30T17:15:30Z"
}
```

---

## Terminal WebSocket Endpoint

### WebSocket /ws/terminal/:projectId/:sessionId

**Client → Server (Command):**
```json
{
  "type": "COMMAND",
  "command": "vie push",
  "timestamp": "2025-01-30T14:22:00Z"
}
```

**Server → Client (Output):**
```json
{
  "type": "OUTPUT",
  "data": "Your code has been submitted for review!",
  "timestamp": "2025-01-30T14:22:05Z"
}
```

```json
{
  "type": "RESULT",
  "success": true,
  "exitCode": 0,
  "data": {
    "submissionId": "sub_789",
    "status": "CI_RUNNING"
  },
  "timestamp": "2025-01-30T14:22:30Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request",
  "details": {
    "field": "branch",
    "message": "Branch name is required"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Permission denied",
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Submission not found"
}
```

### 422 Unprocessable Entity (Validation)
```json
{
  "success": false,
  "error": "Validation failed",
  "violations": [
    {
      "ruleId": "commit-message-length",
      "message": "Commit message must be at least 10 characters"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

All API endpoints implement rate limiting:
- **Default**: 100 requests per minute per user
- **CI/CD endpoints**: 10 requests per minute (to prevent abuse)
- **Authentication**: 5 login attempts per minute per IP

**Response Header:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1675087200
```

---

## Pagination

List endpoints support pagination:

**Query Params:**
- `limit`: Items per page (default: 10, max: 100)
- `offset`: Starting position (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```
