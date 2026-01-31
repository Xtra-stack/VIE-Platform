# VIE COMMAND INTERFACE SPECIFICATION

## Overview

VIE provides an internal command-driven interface that hides raw Git operations behind company-style commands. Commands are executed via the web terminal and processed server-side.

---

## Command Syntax & Structure

### General Format
```
vie <command> [subcommand] [arguments] [options]
```

### Response Format (JSON)
```json
{
  "success": true|false,
  "message": "User-friendly message",
  "data": { /* command-specific data */ },
  "error": "Error message if failed",
  "timestamp": "ISO-8601"
}
```

---

## Authentication Commands

### vie login
```bash
vie login
# Interactive prompt for username & password
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome back, Sarah Chen! You are logged in as Senior Developer.",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "username": "schen",
      "fullName": "Sarah Chen",
      "role": "SENIOR_DEV"
    }
  }
}
```

### vie logout
```bash
vie logout
```

**Response:**
```json
{
  "success": true,
  "message": "You have been logged out."
}
```

### vie whoami
```bash
vie whoami
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "ajay.patel",
    "fullName": "Ajay Patel",
    "role": "JUNIOR_DEV",
    "company": "Acme Corp",
    "department": "Engineering"
  }
}
```

---

## Project Commands

### vie project list
```bash
vie project list
```

**Response:**
```json
{
  "success": true,
  "message": "You have access to 3 projects.",
  "data": {
    "projects": [
      {
        "id": "proj_123",
        "name": "Backend API",
        "description": "Core REST API",
        "currentBranch": "main",
        "role": "DEVELOPER",
        "lastActivityAt": "2025-01-30T14:22:00Z"
      },
      {
        "id": "proj_124",
        "name": "Mobile App",
        "description": "iOS/Android client",
        "currentBranch": "feature-auth",
        "role": "DEVELOPER",
        "lastActivityAt": "2025-01-29T09:15:00Z"
      }
    ]
  }
}
```

### vie project clone <project-name>
```bash
vie project clone backend-api
# Creates working directory and initializes local workspace
```

**Response:**
```json
{
  "success": true,
  "message": "Project 'Backend API' cloned successfully.",
  "data": {
    "projectPath": "/workspace/backend-api",
    "branch": "main",
    "filesCount": 156,
    "message": "You are ready to start developing. Create a branch with: vie branch <name>"
  }
}
```

### vie project info
```bash
vie project info
# Shows info about current project
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Backend API",
    "description": "Core REST API service",
    "members": 5,
    "recentSubmissions": 3,
    "mainBranch": "main",
    "rules": {
      "commitMessageFormat": "Must be 10+ characters",
      "minLength": 10,
      "blockedKeywords": ["TODO", "FIXME", "WIP"]
    }
  }
}
```

---

## Branch Commands

### vie branch list
```bash
vie branch list
# Lists all branches in project
```

**Response:**
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "name": "main",
        "isActive": true,
        "isProtected": true,
        "lastCommit": "abc123",
        "lastCommitMessage": "Release v1.2.0",
        "createdAt": "2024-12-01T10:00:00Z"
      },
      {
        "name": "feature-login",
        "isActive": true,
        "isProtected": false,
        "lastCommit": "def456",
        "lastCommitMessage": "Add OAuth2 integration",
        "createdAt": "2025-01-20T14:30:00Z"
      }
    ],
    "currentBranch": "feature-login"
  }
}
```

### vie branch create <branch-name>
```bash
vie branch create feature-user-dashboard
# Creates new branch from current branch
```

**Response:**
```json
{
  "success": true,
  "message": "Branch 'feature-user-dashboard' created successfully.",
  "data": {
    "branch": "feature-user-dashboard",
    "basedOn": "main",
    "message": "Switched to new branch. Start making changes!"
  }
}
```

### vie branch switch <branch-name>
```bash
vie branch switch feature-login
# Switch to existing branch (must have clean working directory)
```

**Response:**
```json
{
  "success": true,
  "message": "Switched to branch 'feature-login'.",
  "data": {
    "branch": "feature-login",
    "status": "clean"
  }
}
```

### vie branch delete <branch-name>
```bash
vie branch delete feature-old-work
# Delete a branch (cannot delete current or main)
```

**Response:**
```json
{
  "success": true,
  "message": "Branch 'feature-old-work' has been deleted."
}
```

---

## Code Management Commands

### vie status
```bash
vie status
# Shows current branch and uncommitted changes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentBranch": "feature-login",
    "changedFiles": {
      "added": ["src/auth/oauth.js"],
      "modified": ["src/user.js", "src/controllers/auth.js"],
      "deleted": []
    },
    "totalChanges": 3,
    "message": "You have 3 files with changes. Use 'vie commit' to save them."
  }
}
```

### vie diff <file-name> (optional)
```bash
vie diff src/user.js
# Shows unified diff for specific file or all files
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "file": "src/user.js",
        "additions": 15,
        "deletions": 3,
        "diff": "--- src/user.js\n+++ src/user.js\n@@ -10,5 +10,5 @@ ..."
      }
    ]
  }
}
```

### vie commit "<message>"
```bash
vie commit "Add OAuth2 login flow"
# Stages all changes and creates a commit
```

**Response:**
```json
{
  "success": true,
  "message": "Changes committed successfully.",
  "data": {
    "commitHash": "abc123def456",
    "branch": "feature-login",
    "filesChanged": 3,
    "message": "Your changes are saved locally. Use 'vie push' to submit for review."
  }
}
```

### vie log [--oneline] [--limit N]
```bash
vie log --oneline --limit 10
# Shows commit history
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commits": [
      {
        "hash": "abc123",
        "message": "Add OAuth2 login flow",
        "author": "Ajay Patel",
        "timestamp": "2025-01-30T14:22:00Z"
      },
      {
        "hash": "def456",
        "message": "Setup auth service",
        "author": "Ajay Patel",
        "timestamp": "2025-01-30T10:15:00Z"
      }
    ]
  }
}
```

---

## Submission & Review Commands

### vie push
```bash
vie push
# Submit code for review (server-side git operations, user doesn't see git)
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Your code has been submitted for review!",
  "data": {
    "submissionId": "sub_789",
    "branch": "feature-login",
    "targetBranch": "main",
    "commitCount": 2,
    "filesChanged": 5,
    "additions": 234,
    "deletions": 45,
    "nextSteps": [
      "Automated tests will run immediately",
      "Results will appear in your dashboard",
      "A Senior Developer will review once tests pass"
    ]
  }
}
```

**Response (Failure - Cannot push to main):**
```json
{
  "success": false,
  "error": "Cannot push to main branch. Only Managers can merge to main. Use a feature branch instead.",
  "data": {
    "currentBranch": "main",
    "suggestion": "Create a new feature branch: vie branch feature-your-work"
  }
}
```

**Response (Failure - Validation rules):**
```json
{
  "success": false,
  "error": "Your commit messages don't meet project requirements.",
  "details": {
    "failedRules": [
      {
        "rule": "minLength",
        "message": "Commit message must be at least 10 characters",
        "commitHash": "abc123",
        "commitMessage": "Fix bug"
      }
    ]
  }
}
```

### vie submissions list
```bash
vie submissions list
# Show all my submissions
```

**Response:**
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
        "submittedAt": "2025-01-30T14:22:00Z",
        "ciStatus": "PASSED",
        "reviewStatus": "IN_PROGRESS",
        "reviewedBy": "Sarah Chen"
      },
      {
        "id": "sub_788",
        "branch": "feature-db-migration",
        "title": "Add user_profiles table",
        "status": "APPROVED",
        "submittedAt": "2025-01-28T09:10:00Z",
        "ciStatus": "PASSED",
        "reviewStatus": "APPROVED",
        "reviewedBy": "John Smith"
      }
    ]
  }
}
```

### vie submission view <submission-id>
```bash
vie submission view sub_789
# View details of specific submission
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sub_789",
    "branch": "feature-login",
    "targetBranch": "main",
    "status": "AWAITING_REVIEW",
    "submittedAt": "2025-01-30T14:22:00Z",
    "submittedBy": "Ajay Patel",
    "commits": [
      {
        "hash": "abc123",
        "message": "Add OAuth2 login flow",
        "timestamp": "2025-01-30T14:20:00Z"
      }
    ],
    "ciPipeline": {
      "status": "PASSED",
      "stages": [
        {
          "name": "Build",
          "status": "PASSED",
          "duration": "12s"
        },
        {
          "name": "Tests",
          "status": "PASSED",
          "results": "All 234 tests passed"
        }
      ]
    },
    "reviews": [
      {
        "reviewer": "Sarah Chen",
        "role": "SENIOR_DEV",
        "status": "IN_PROGRESS",
        "startedAt": "2025-01-30T15:00:00Z"
      }
    ]
  }
}
```

---

## Reviewer Commands (Senior Developer)

### vie reviews list
```bash
vie reviews list
# Show all pending reviews assigned to me
```

**Response:**
```json
{
  "success": true,
  "message": "You have 3 pending reviews.",
  "data": {
    "reviews": [
      {
        "id": "rev_123",
        "submissionId": "sub_789",
        "submittedBy": "Ajay Patel",
        "branch": "feature-login",
        "title": "Add OAuth2 login flow",
        "requestedAt": "2025-01-30T14:22:00Z",
        "ciStatus": "PASSED",
        "filesChanged": 5
      }
    ]
  }
}
```

### vie review approve <submission-id> [--comment "message"]
```bash
vie review approve sub_789 --comment "Looks good, great implementation!"
# Approve a submission
```

**Response:**
```json
{
  "success": true,
  "message": "You have approved this submission.",
  "data": {
    "submissionId": "sub_789",
    "status": "REVIEWER_APPROVED",
    "nextStep": "Waiting for Manager final approval",
    "approvedAt": "2025-01-30T16:45:00Z"
  }
}
```

### vie review reject <submission-id> --reason "message"
```bash
vie review reject sub_789 --reason "Please add error handling for OAuth failures"
# Reject a submission
```

**Response:**
```json
{
  "success": true,
  "message": "You have rejected this submission.",
  "data": {
    "submissionId": "sub_789",
    "status": "REVIEWER_REJECTED",
    "reason": "Please add error handling for OAuth failures",
    "nextStep": "Developer will receive notification and can re-submit after fixing",
    "rejectedAt": "2025-01-30T16:50:00Z"
  }
}
```

---

## Manager Commands

### vie approvals list
```bash
vie approvals list
# Show all pending manager approvals
```

**Response:**
```json
{
  "success": true,
  "message": "You have 2 submissions awaiting final approval.",
  "data": {
    "approvals": [
      {
        "id": "sub_789",
        "branch": "feature-login",
        "title": "Add OAuth2 login flow",
        "submittedBy": "Ajay Patel",
        "reviewedBy": "Sarah Chen",
        "requestedAt": "2025-01-30T14:22:00Z",
        "reviewCompletedAt": "2025-01-30T16:45:00Z",
        "canDeploy": true
      }
    ]
  }
}
```

### vie approve <submission-id> [--deploy]
```bash
vie approve sub_789 --deploy
# Manager approves and optionally triggers deployment
```

**Response:**
```json
{
  "success": true,
  "message": "Submission approved and deployment started!",
  "data": {
    "submissionId": "sub_789",
    "status": "APPROVED",
    "deployment": {
      "id": "dep_456",
      "status": "INITIALIZING",
      "environment": "STAGING",
      "message": "Deployment has started. Monitor progress in your dashboard."
    }
  }
}
```

### vie deployment status <deployment-id>
```bash
vie deployment status dep_456
# Check deployment progress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dep_456",
    "status": "DEPLOYING",
    "environment": "STAGING",
    "progress": 65,
    "currentStage": "Running migrations",
    "stages": [
      {
        "name": "Pre-deploy checks",
        "status": "COMPLETED",
        "duration": "2m 15s"
      },
      {
        "name": "Database migration",
        "status": "IN_PROGRESS",
        "startedAt": "2025-01-30T17:00:00Z"
      },
      {
        "name": "Service deployment",
        "status": "PENDING",
        "estimate": "5 minutes"
      },
      {
        "name": "Smoke tests",
        "status": "PENDING"
      }
    ]
  }
}
```

### vie deployment logs <deployment-id> [--follow]
```bash
vie deployment logs dep_456 --follow
# Stream deployment logs in real-time
```

---

## Help & Information Commands

### vie help
```bash
vie help
# Show all available commands
```

### vie help <command>
```bash
vie help push
# Show help for specific command
```

### vie config
```bash
vie config
# Show current configuration
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": "ajay.patel",
    "role": "JUNIOR_DEV",
    "project": "Backend API",
    "branch": "feature-login",
    "serverUrl": "https://vie.acme-corp.internal"
  }
}
```

---

## Error Message Standards

### Rule Validation Error
```
Error: Code push rejected

Your commit message doesn't meet requirements:
  ❌ "Fix bug" - Must be at least 10 characters (6/10)

Fix it:
  1. View your changes: vie status
  2. Amend your last commit: vie commit "Fix authentication bug in login flow"
  3. Push again: vie push
```

### Permission Error
```
Error: Operation not permitted

You are a Junior Developer and cannot deploy code.
Deployments are triggered by Managers after code review.

Your submission #sub_789 is approved and queued for deployment.
Check its status: vie submission view sub_789
```

### CI Pipeline Failure
```
Error: Automated tests failed (3 failures)

Tests must pass before your code can be reviewed.

Failed tests:
  ❌ AuthService.js - 2 failures
  ❌ UserController.js - 1 failure

View logs: vie submission view sub_789

Fix the failures and push again:
  vie commit "Fix failing tests"
  vie push
```

---

## Response Time Expectations

- Quick commands (status, list): < 500ms
- Git operations (push, branch create): 1-3s
- CI/CD operations: 30s - 10min (realistic)
- Deployment: 5-20min (realistic)
