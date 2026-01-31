# VIE DATABASE SCHEMA

## MongoDB Collections

### 1. users

```javascript
{
  _id: ObjectId,
  
  // Identity
  username: String (unique),
  email: String (unique),
  password: String (bcrypted),
  fullName: String,
  
  // Role & Company
  role: Enum ["JUNIOR_DEV", "SENIOR_DEV", "MANAGER"],
  companyId: ObjectId (ref: companies),
  department: String, // "Engineering", "DevOps", etc.
  
  // Account Status
  isActive: Boolean,
  joinedAt: Date,
  lastLogin: Date,
  
  // Permissions (can override defaults later)
  canReview: Boolean,
  canDeploy: Boolean,
  canApproveDeployment: Boolean,
  
  // Metadata
  avatar: String (URL or base64),
  bio: String,
}
```

### 2. companies

```javascript
{
  _id: ObjectId,
  
  // Identity
  name: String, // "Acme Corp", "TechCo", etc.
  slug: String (unique), // "acme-corp"
  
  // Configuration
  timezone: String,
  country: String,
  
  // Limits
  maxProjects: Number,
  maxUsers: Number,
  
  createdAt: Date,
  updatedAt: Date,
}
```

### 3. projects

```javascript
{
  _id: ObjectId,
  
  // Identity
  name: String, // "Backend API", "Mobile App", etc.
  slug: String (unique within company),
  description: String,
  companyId: ObjectId (ref: companies),
  
  // Repository
  repositoryPath: String, // "/repos/acme-corp/backend-api"
  gitRemoteUrl: String, // internal git server URL (hidden from user)
  
  // Access Control
  members: [
    {
      userId: ObjectId (ref: users),
      role: Enum ["DEVELOPER", "LEAD", "MANAGER"],
      joinedAt: Date,
    }
  ],
  
  // Settings
  mainBranch: String, // "main"
  branchProtection: {
    mainBranchLocked: Boolean,
    requireReview: Boolean,
    requiredReviewers: Number, // 1 or 2 typically
  },
  
  // Rules & Validation
  validationRules: {
    commitMessageFormat: String, // regex pattern
    blockedKeywords: [String],
    minCommitMessageLength: Number,
    filePatterns: {
      allowed: [String],
      blocked: [String],
    },
  },
  
  // CI/CD Configuration
  cicdEnabled: Boolean,
  testCommand: String, // "npm test" or "jest"
  testTimeout: Number, // milliseconds
  
  // Deployment Configuration
  deploymentEnvironments: [
    {
      name: Enum ["STAGING", "PRODUCTION"],
      branch: String,
      autoDeployOnApproval: Boolean,
    }
  ],
  
  // Metadata
  createdAt: Date,
  createdBy: ObjectId (ref: users),
  updatedAt: Date,
}
```

### 4. code_submissions

```javascript
{
  _id: ObjectId,
  
  // Submission Identity
  projectId: ObjectId (ref: projects),
  submittedBy: ObjectId (ref: users),
  sourceBranch: String, // "feature-login"
  targetBranch: String, // "main"
  
  // Submission Content
  title: String, // commit message or PR title
  description: String,
  commits: [
    {
      hash: String,
      message: String,
      author: String,
      timestamp: Date,
      files: {
        added: [String],
        modified: [String],
        deleted: [String],
      },
    }
  ],
  
  // Diff Information
  diffStat: {
    filesChanged: Number,
    additions: Number,
    deletions: Number,
  },
  diffUrl: String, // internal URL to view diff
  
  // Workflow Status
  status: Enum [
    "SUBMITTED",
    "CI_RUNNING",
    "CI_PASSED",
    "CI_FAILED",
    "AWAITING_REVIEW",
    "REVIEWER_APPROVED",
    "REVIEWER_REJECTED",
    "AWAITING_MANAGER_APPROVAL",
    "MANAGER_APPROVED",
    "MANAGER_REJECTED",
    "MERGED",
    "DEPLOYMENT_IN_PROGRESS",
    "DEPLOYMENT_SUCCESSFUL",
    "DEPLOYMENT_FAILED",
  ],
  
  // CI/CD
  ciPipeline: {
    startedAt: Date,
    completedAt: Date,
    duration: Number, // milliseconds
    status: Enum ["PENDING", "RUNNING", "PASSED", "FAILED"],
    stages: [
      {
        name: String, // "build", "test", "lint"
        status: Enum ["PENDING", "RUNNING", "PASSED", "FAILED"],
        startedAt: Date,
        completedAt: Date,
        logs: String,
      }
    ],
    testResults: {
      total: Number,
      passed: Number,
      failed: Number,
      coverage: Number, // percentage
    },
  },
  
  // Review Information
  reviews: [
    {
      reviewerId: ObjectId (ref: users),
      reviewerRole: String, // "SENIOR_DEV" or "MANAGER"
      status: Enum ["PENDING", "APPROVED", "REJECTED"],
      submittedAt: Date,
      comments: [
        {
          author: ObjectId (ref: users),
          text: String,
          createdAt: Date,
          lineNumber: Number, // optional, for inline comments
          file: String, // optional
        }
      ],
    }
  ],
  
  // Timestamps
  submittedAt: Date,
  resolvedAt: Date, // when merged or rejected
  
  // Metadata
  tags: [String],
}
```

### 5. reviews

```javascript
{
  _id: ObjectId,
  
  // Reference
  submissionId: ObjectId (ref: code_submissions),
  projectId: ObjectId (ref: projects),
  
  // Reviewer
  reviewerId: ObjectId (ref: users),
  reviewerRole: Enum ["SENIOR_DEV", "MANAGER"],
  
  // Review Content
  status: Enum ["REQUESTED", "IN_PROGRESS", "APPROVED", "REJECTED"],
  
  // Comments
  overallComment: String,
  inlineComments: [
    {
      lineNumber: Number,
      file: String,
      comment: String,
      createdAt: Date,
    }
  ],
  
  // Decision
  decision: Enum ["APPROVED", "REJECTED", "PENDING"],
  decidedAt: Date,
  
  // Timestamps
  requestedAt: Date,
  startedAt: Date,
  completedAt: Date,
}
```

### 6. deployments

```javascript
{
  _id: ObjectId,
  
  // Reference
  projectId: ObjectId (ref: projects),
  submissionId: ObjectId (ref: code_submissions),
  approvedBy: ObjectId (ref: users), // Manager who approved
  
  // Deployment Details
  environment: Enum ["STAGING", "PRODUCTION"],
  branch: String, // "main"
  commitHash: String,
  
  // Deployment Status
  status: Enum [
    "QUEUED",
    "INITIALIZING",
    "BUILDING",
    "DEPLOYING",
    "SUCCESS",
    "FAILED",
    "ROLLED_BACK",
  ],
  
  // Deployment Progress
  stages: [
    {
      name: String, // "pre-deploy", "migrate-db", "deploy", "smoke-test"
      status: Enum ["PENDING", "RUNNING", "SUCCESS", "FAILED"],
      startedAt: Date,
      completedAt: Date,
      logs: String,
      errorMessage: String,
    }
  ],
  
  // Overall Logs
  logs: [
    {
      timestamp: Date,
      level: Enum ["INFO", "WARN", "ERROR"],
      message: String,
    }
  ],
  
  // Results
  duration: Number, // milliseconds
  successMessage: String,
  errorMessage: String,
  rollbackAvailable: Boolean,
  
  // Timestamps
  createdAt: Date,
  startedAt: Date,
  completedAt: Date,
  
  // Audit
  createdBy: ObjectId (ref: users),
  viewedBy: [ObjectId], // users who viewed this deployment
}
```

### 7. branches

```javascript
{
  _id: ObjectId,
  
  // Identity
  projectId: ObjectId (ref: projects),
  name: String, // "main", "feature-login", "hotfix-bug"
  
  // Branch Info
  creator: ObjectId (ref: users),
  createdAt: Date,
  lastCommit: {
    hash: String,
    message: String,
    author: String,
    timestamp: Date,
  },
  
  // Status
  isProtected: Boolean,
  isActive: Boolean,
  
  // Linked Submission (if this branch has a pending review)
  linkedSubmissionId: ObjectId (ref: code_submissions),
}
```

### 8. audit_log

```javascript
{
  _id: ObjectId,
  
  // What Happened
  action: String, // "PUSH_CODE", "REVIEW_APPROVED", "DEPLOYMENT_STARTED", etc.
  actionType: Enum [
    "CODE_PUSH",
    "CODE_REVIEW",
    "APPROVAL",
    "REJECTION",
    "DEPLOYMENT_START",
    "DEPLOYMENT_SUCCESS",
    "DEPLOYMENT_FAILURE",
    "USER_LOGIN",
    "USER_LOGOUT",
    "PERMISSION_CHANGE",
  ],
  
  // Who Did It
  userId: ObjectId (ref: users),
  userRole: String,
  
  // Context
  projectId: ObjectId (ref: projects),
  submissionId: ObjectId (ref: code_submissions),
  deploymentId: ObjectId (ref: deployments),
  
  // Details
  details: {
    branch: String,
    commit: String,
    reviewStatus: String,
    errorMessage: String,
    [key: string]: any, // flexible for additional context
  },
  
  // Timestamp
  timestamp: Date,
  
  // Metadata
  ipAddress: String,
  userAgent: String,
}
```

### 9. terminal_sessions

```javascript
{
  _id: ObjectId,
  
  // Session Info
  userId: ObjectId (ref: users),
  projectId: ObjectId (ref: projects),
  sessionId: String (unique),
  
  // Terminal State
  currentBranch: String,
  workingDirectory: String,
  
  // Command History
  commandHistory: [
    {
      command: String,
      output: String,
      exitCode: Number,
      executedAt: Date,
      duration: Number, // milliseconds
    }
  ],
  
  // Session Metadata
  createdAt: Date,
  lastActivityAt: Date,
  closedAt: Date,
  isActive: Boolean,
}
```

---

## Indexes (Performance)

```javascript
// users
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ companyId: 1 });

// projects
db.projects.createIndex({ slug: 1, companyId: 1 }, { unique: true });
db.projects.createIndex({ companyId: 1 });

// code_submissions
db.code_submissions.createIndex({ projectId: 1 });
db.code_submissions.createIndex({ submittedBy: 1 });
db.code_submissions.createIndex({ status: 1 });
db.code_submissions.createIndex({ submittedAt: -1 });

// reviews
db.reviews.createIndex({ submissionId: 1 });
db.reviews.createIndex({ reviewerId: 1 });
db.reviews.createIndex({ status: 1 });

// deployments
db.deployments.createIndex({ projectId: 1 });
db.deployments.createIndex({ status: 1 });
db.deployments.createIndex({ createdAt: -1 });

// audit_log
db.audit_log.createIndex({ userId: 1 });
db.audit_log.createIndex({ action: 1 });
db.audit_log.createIndex({ timestamp: -1 });
db.audit_log.createIndex({ projectId: 1 });
```

---

## Key Design Decisions

1. **Denormalization**: Submission includes full diff and commit info for fast queries
2. **Audit Trail**: Every action logged for compliance and debugging
3. **Status Tracking**: Detailed status enums allow for accurate workflow state
4. **Flexible Reviews**: Single submission can have multiple reviews (Senior + Manager)
5. **Isolated Repositories**: Each project gets separate git directory on filesystem
6. **Terminal Sessions**: Tracks user's current working state (branch, directory)
