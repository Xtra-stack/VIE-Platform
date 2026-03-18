# VIE Platform - Workspace API Reference

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🔹 WORKSPACE MANAGEMENT ENDPOINTS

### 1. Create Workspace (Manager Only)
```http
POST /api/project-workspaces
```

**Request Body:**
```json
{
  "name": "User Authentication Feature",
  "projectId": "507f1f77bcf86cd799439011",
  "projectType": "NEW_FEATURE",
  "techArea": "FULLSTACK",
  "assignedJuniors": ["507f1f77bcf86cd799439012"],
  "assignedSeniors": ["507f1f77bcf86cd799439013"]
}
```

**Project Types:**
- `NEW_FEATURE` - New feature development
- `NEW_PROJECT` - Completely new project
- `BUG_FIX` - Bug fixing task
- `UPDATE` - Update existing feature
- `ENHANCEMENT` - Improve existing code

**Tech Areas:**
- `FRONTEND` - Frontend development
- `BACKEND` - Backend development
- `FULLSTACK` - Both frontend and backend

**Response:**
```json
{
  "success": true,
  "data": {
    "workspace": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "User Authentication Feature",
      "projectType": "NEW_FEATURE",
      "techArea": "FULLSTACK",
      "status": "ACTIVE",
      "createdAt": "2026-02-05T10:30:00.000Z"
    },
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "workspaceId": "507f1f77bcf86cd799439014",
        "title": "User Authentication Feature",
        "status": "ASSIGNED",
        "assignedTo": "507f1f77bcf86cd799439012"
      }
    ]
  }
}
```

---

### 2. List All Workspaces
```http
GET /api/project-workspaces
```

**Query Parameters:**
- `status` (optional): Filter by status (`ACTIVE`, `COMPLETED`, `ARCHIVED`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "User Authentication Feature",
      "projectType": "NEW_FEATURE",
      "techArea": "FULLSTACK",
      "status": "ACTIVE",
      "assignedJuniors": [
        { "_id": "...", "username": "junior1", "fullName": "John Doe" }
      ],
      "assignedSeniors": [
        { "_id": "...", "username": "senior1", "fullName": "Jane Smith" }
      ]
    }
  ]
}
```

---

### 3. Get Workspace Details
```http
GET /api/project-workspaces/:workspaceId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workspace": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "User Authentication Feature",
      "projectType": "NEW_FEATURE",
      "techArea": "FULLSTACK",
      "assignedJuniors": [...],
      "assignedSeniors": [...]
    },
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "title": "User Authentication Feature",
        "status": "IN_PROGRESS",
        "assignedTo": {...}
      }
    ]
  }
}
```

---

## 🔹 TASK MANAGEMENT ENDPOINTS

### 4. Get My Tasks (Junior Only)
```http
GET /api/project-workspaces/tasks/my-tasks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "workspaceId": {...},
      "title": "User Authentication Feature",
      "description": "Implement login and signup",
      "projectType": "NEW_FEATURE",
      "techArea": "FULLSTACK",
      "status": "ASSIGNED",
      "assignedTo": "507f1f77bcf86cd799439012",
      "assignedBy": {...},
      "createdAt": "2026-02-05T10:30:00.000Z"
    }
  ]
}
```

**Task Status Flow:**
1. `ASSIGNED` - Initial state when task created
2. `IN_PROGRESS` - Junior started working
3. `SUBMITTED` - Code submitted for review
4. `CHANGES_REQUESTED` - Senior/Manager requested changes
5. `APPROVED` - Final approval by Manager

---

### 5. Update Task Status
```http
PATCH /api/project-workspaces/tasks/:taskId
```

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "submissionId": "507f1f77bcf86cd799439016" 
}
```

**Note:** `submissionId` is optional, only needed when status is `SUBMITTED`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "IN_PROGRESS",
    "updatedAt": "2026-02-05T11:00:00.000Z"
  }
}
```

---

## 🔹 FILE MANAGEMENT ENDPOINTS

### 6. Upload Base Code (Manager Only)
```http
POST /api/project-workspaces/:workspaceId/base-code
```

**Use Case:** When project type is UPDATE or BUG_FIX

**Request Body:**
```json
{
  "files": [
    {
      "fileName": "auth.js",
      "content": "const express = require('express');\n...",
      "size": 1024
    },
    {
      "fileName": "user.model.js",
      "content": "const mongoose = require('mongoose');\n...",
      "size": 512
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workspace": {
      "_id": "507f1f77bcf86cd799439014",
      "hasBaseCode": true,
      "baseCodePath": "/workspaces/507f1f77bcf86cd799439014/base-code",
      "workingCopyPath": "/workspaces/507f1f77bcf86cd799439014/working-copy"
    },
    "files": [
      {
        "_id": "507f1f77bcf86cd799439017",
        "fileName": "auth.js",
        "fileType": "BASE_CODE",
        "isReadOnly": true
      }
    ]
  }
}
```

---

### 7. Get Base Code Files (Read-Only)
```http
GET /api/project-workspaces/:workspaceId/base-code-files
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "fileName": "auth.js",
      "filePath": "/workspaces/.../base-code/auth.js",
      "content": "const express = require('express');\n...",
      "fileType": "BASE_CODE",
      "isReadOnly": true,
      "version": 1,
      "uploadedAt": "2026-02-05T10:35:00.000Z"
    }
  ]
}
```

---

### 8. Get Working Copy Files
```http
GET /api/project-workspaces/:workspaceId/working-copy-files
```

**Response:** Same structure as base code files, but with `fileType: "WORKING_COPY"` and `isReadOnly: false`

---

### 9. Update Working Copy File (Junior Only)
```http
PATCH /api/project-workspaces/:workspaceId/working-files
```

**Request Body:**
```json
{
  "filePath": "/workspaces/507f1f77bcf86cd799439014/working-copy/auth.js",
  "content": "const express = require('express');\n// Fixed authentication bug\n..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "fileName": "auth.js",
    "content": "const express = require('express');\n// Fixed...",
    "version": 2,
    "uploadedAt": "2026-02-05T12:00:00.000Z"
  }
}
```

---

## 🔹 BUILD SIMULATION

Build results are automatically generated when Junior submits code.

**Build Log Response Example:**
```json
{
  "_id": "507f1f77bcf86cd799439019",
  "submissionId": "507f1f77bcf86cd799439016",
  "status": "SUCCESS",
  "testResults": {
    "total": 47,
    "passed": 47,
    "failed": 0,
    "skipped": 0,
    "coverage": 87.5,
    "coverageThreshold": 75,
    "passedThreshold": true
  },
  "duration": 3420,
  "logs": "[2026-02-05T12:05:00] Starting FULL build...\n..."
}
```

**Coverage Threshold:**
- Minimum: 75%
- If coverage < 75%: `passedThreshold: false` (Build still passes, but warning shown)
- If coverage >= 75%: `passedThreshold: true`

---

## 🔹 ERROR RESPONSES

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (role permission error)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 🔹 ROLE PERMISSIONS

| Endpoint | Junior | Senior | Manager |
|----------|--------|--------|---------|
| Create Workspace | ❌ | ❌ | ✅ |
| List Workspaces | ✅ | ✅ | ✅ |
| Get Workspace | ✅ | ✅ | ✅ |
| Upload Base Code | ❌ | ❌ | ✅ |
| Get My Tasks | ✅ | ❌ | ❌ |
| Update Task Status | ✅ | ❌ | ✅ |
| Get Base Code Files | ✅ | ✅ | ✅ |
| Get Working Copy | ✅ | ✅ | ✅ |
| Update Working File | ✅ | ❌ | ❌ |

---

## 🔹 FRONTEND API CALLS

All API calls are available in `frontend/src/services/api.js`:

```javascript
import { 
  createProjectWorkspace,
  getProjectWorkspaces,
  getProjectWorkspace,
  uploadBaseCode,
  getMyTasks,
  updateTaskStatus,
  getBaseCodeFiles,
  getWorkingCopyFiles,
  updateWorkingFile
} from '../services/api.js';

// Example: Create workspace
const result = await createProjectWorkspace({
  name: 'User Auth',
  projectId: '...',
  projectType: 'NEW_FEATURE',
  techArea: 'FULLSTACK'
});

// Example: Get my tasks
const tasks = await getMyTasks();

// Example: Update task status
await updateTaskStatus(taskId, 'IN_PROGRESS');
```

---

## 🎯 WORKFLOW SEQUENCE

### Complete Workflow Example:

1. **Manager creates workspace:**
```javascript
POST /api/project-workspaces
{
  "name": "Login Feature",
  "projectId": "...",
  "projectType": "NEW_FEATURE",
  "techArea": "FULLSTACK",
  "assignedJuniors": ["juniorId"]
}
```

2. **Junior gets tasks:**
```javascript
GET /api/project-workspaces/tasks/my-tasks
// Returns: [{ status: "ASSIGNED", ... }]
```

3. **Junior starts work:**
```javascript
PATCH /api/project-workspaces/tasks/:taskId
{ "status": "IN_PROGRESS" }
```

4. **Junior submits code:**
```javascript
POST /api/submissions
{
  "projectId": "...",
  "title": "Login Feature",
  "codeSnippet": "...",
  ...
}
```

5. **Build runs automatically** (mock simulation)
   - Test results generated
   - Coverage checked
   - Logs created

6. **Senior reviews:**
```javascript
POST /api/reviews/:submissionId/approve
{ "comment": "Looks good!" }
```

7. **Manager final approval:**
```javascript
POST /api/submissions/:id/approve-manager
{ "comment": "Deploying to production" }
```

8. **Task marked as approved:**
```javascript
PATCH /api/project-workspaces/tasks/:taskId
{ "status": "APPROVED" }
```

---

## 📝 NOTES

- All dates are in ISO 8601 format
- ObjectIds are MongoDB 24-character hex strings
- File content is stored as plain text in database (use base64 for binary)
- Coverage threshold is hardcoded at 75% (can be made configurable)
- Build simulation runs synchronously (2-5 second delay)

---

**Happy Coding! 🚀**
