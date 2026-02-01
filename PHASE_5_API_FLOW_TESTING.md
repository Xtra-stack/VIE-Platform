# Phase 5: API Flow Testing & Verification (VIE)

This document verifies the end-to-end submission workflow using backend APIs only. It focuses on role-based access control (RBAC), workflow sequencing, and failure modes.

---

## 0) Prerequisites

- Seeded demo data: `DEMO_SEED=true npm run seed`
- Test users:
  - Manager: `manager1 / password123`
  - Senior: `senior1 / password123`
  - Junior: `junior1 / password123`
- Base URL: `http://localhost:3000`

> All requests require `Authorization: Bearer <token>` unless specified.

---

## 1) Authentication (Get Tokens)

### 1.1 Login (Junior)
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "junior1",
  "password": "password123"
}
```
- **Success Response (200)**:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "<userId>",
    "username": "junior1",
    "role": "JUNIOR"
  }
}
```
- **Failure Response (401)**:
```json
{
  "message": "Invalid credentials"
}
```

### 1.2 Login (Senior)
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "senior1",
  "password": "password123"
}
```
- **Success Response (200)**: same structure as above, role `SENIOR`
- **Failure Response (401)**: same as above

### 1.3 Login (Manager)
- **Method**: POST
- **Endpoint**: `/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "manager1",
  "password": "password123"
}
```
- **Success Response (200)**: same structure as above, role `MANAGER`
- **Failure Response (401)**: same as above

---

## 2) End-to-End Workflow (Happy Paths)

### 2.1 Junior creates a submission
- **Method**: POST
- **Endpoint**: `/api/submissions`
- **Headers**: `Authorization: Bearer <junior_token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "projectId": "<demo_project_id>",
  "sourceBranch": "feature/auth-system",
  "targetBranch": "develop",
  "title": "Add user authentication feature",
  "description": "Implements JWT auth and RBAC"
}
```
- **Success Response (201)**:
```json
{
  "id": "<submission_id>",
  "status": "AWAITING_REVIEW",
  "submittedBy": "<junior_id>",
  "projectId": "<demo_project_id>",
  "title": "Add user authentication feature"
}
```
- **Failure Response (403)**:
```json
{
  "message": "Forbidden"
}
```

### 2.2 Senior approves review (first stage)
- **Method**: POST
- **Endpoint**: `/api/reviews/:submissionId/approve`
- **Headers**: `Authorization: Bearer <senior_token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "overallComment": "Looks good. Approved.",
  "inlineComments": [
    {
      "lineNumber": 42,
      "file": "src/auth/jwt.js",
      "comment": "Consider refresh token support."
    }
  ]
}
```
- **Success Response (200)**:
```json
{
  "message": "Review approved",
  "submissionStatus": "AWAITING_MANAGER_APPROVAL"
}
```
- **Failure Response (404)**:
```json
{
  "message": "Submission not found"
}
```

### 2.3 Manager final approval
- **Method**: POST
- **Endpoint**: `/api/reviews/:submissionId/manager/approve`
- **Headers**: `Authorization: Bearer <manager_token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "overallComment": "Approved for release."
}
```
- **Success Response (200)**:
```json
{
  "message": "Manager approval recorded",
  "submissionStatus": "MANAGER_APPROVED"
}
```
- **Failure Response (400)**:
```json
{
  "message": "Submission is not awaiting manager approval"
}
```

---

## 3) Alternative Happy Path: Senior Requests Changes

### 3.1 Senior requests changes
- **Method**: POST
- **Endpoint**: `/api/reviews/:submissionId/reject`
- **Headers**: `Authorization: Bearer <senior_token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "overallComment": "Please add tests for token expiration.",
  "inlineComments": [
    {
      "lineNumber": 88,
      "file": "src/auth/token.js",
      "comment": "Add edge-case coverage."
    }
  ]
}
```
- **Success Response (200)**:
```json
{
  "message": "Review changes requested",
  "submissionStatus": "REVIEWER_REJECTED"
}
```
- **Failure Response (404)**:
```json
{
  "message": "Submission not found"
}
```

---

## 4) RBAC Verification (Required Failures)

### 4.1 Junior cannot approve review (SENIOR-only)
- **Method**: POST
- **Endpoint**: `/api/reviews/:submissionId/approve`
- **Headers**: `Authorization: Bearer <junior_token>`
- **Failure Response (403)**:
```json
{
  "message": "Forbidden"
}
```

### 4.2 Senior cannot do final manager approval
- **Method**: POST
- **Endpoint**: `/api/reviews/:submissionId/manager/approve`
- **Headers**: `Authorization: Bearer <senior_token>`
- **Failure Response (403)**:
```json
{
  "message": "Forbidden"
}
```

### 4.3 Manager cannot submit code (JUNIOR-only)
- **Method**: POST
- **Endpoint**: `/api/submissions`
- **Headers**: `Authorization: Bearer <manager_token>`
- **Failure Response (403)**:
```json
{
  "message": "Forbidden"
}
```

### 4.4 Missing JWT must fail
- **Method**: POST
- **Endpoint**: `/api/submissions`
- **Headers**: none
- **Failure Response (401)**:
```json
{
  "message": "Unauthorized"
}
```

### 4.5 Invalid JWT must fail
- **Method**: POST
- **Endpoint**: `/api/submissions`
- **Headers**: `Authorization: Bearer invalid.token.here`
- **Failure Response (401)**:
```json
{
  "message": "Unauthorized"
}
```

---

## 5) Workflow Sequencing (Must Fail)

### 5.1 Manager approval without Senior approval
- **Method**: POST
- **Endpoint**: `/api/reviews/:submissionId/manager/approve`
- **Headers**: `Authorization: Bearer <manager_token>`
- **Failure Response (400)**:
```json
{
  "message": "Submission is not awaiting manager approval"
}
```

### 5.2 Senior approves twice (duplicate action)
- **Method**: POST
- **Endpoint**: `/api/reviews/:submissionId/approve`
- **Headers**: `Authorization: Bearer <senior_token>`
- **Failure Response (400)**:
```json
{
  "message": "Review already completed"
}
```

---

## 6) Negative Test Cases (Required)

### 6.1 Wrong role access
- Junior attempts `/api/reviews/:submissionId/approve` → **403**
- Senior attempts `/api/reviews/:submissionId/manager/approve` → **403**
- Manager attempts `/api/submissions` → **403**

### 6.2 Invalid submission state
- Manager approval when submission is `AWAITING_REVIEW` → **400**
- Senior review when submission is `REVIEWER_REJECTED` → **400**

### 6.3 Duplicate actions
- Approving a completed review → **400**
- Rejecting a completed review → **400**

### 6.4 Unauthorized project access
- Senior/Manager not in project tries to review → **403**
- Junior not in project tries to submit → **403**

---

## 7) Interview Explanation

**Why API-level testing was done**
- API testing validates the backend contract directly, without UI noise, ensuring correctness of business logic, RBAC, and workflow state transitions.

**How this simulates real industry QA**
- Teams commonly test critical workflows using direct API calls (Postman/Newman/CI) before UI integration, verifying security and data flow early in the pipeline.

**How RBAC correctness is proven**
- The test matrix explicitly asserts allowed and forbidden routes per role, including invalid tokens and step-skipping attempts, which confirms enforcement in middleware and services.

---

## 8) What Was Validated

- Junior can create submissions; Senior and Manager cannot.
- Senior can approve or request changes; Junior cannot.
- Manager can only finalize after Senior approval.
- Workflow step ordering is enforced.
- Missing/invalid JWT returns 401.
- Wrong role access returns 403.
- Duplicate actions and invalid states return 400.
- Unauthorized project access is blocked.
