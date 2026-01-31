# VIE INITIAL PROJECT STRUCTURE

## Directory Layout

```
VIE/
├── backend/                          # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── env.js               # Environment variables
│   │   │   └── logger.js            # Logging configuration
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── rbac.js              # Role-based access control
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   └── validation.js        # Input validation
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js      # Auth logic
│   │   │   ├── project.service.js   # Project management
│   │   │   ├── git.service.js       # Git operations wrapper
│   │   │   ├── submission.service.js # Code submission logic
│   │   │   ├── review.service.js    # Code review logic
│   │   │   ├── cicd.service.js      # CI/CD pipeline execution
│   │   │   ├── deployment.service.js # Deployment logic
│   │   │   └── terminal.service.js  # Terminal command execution
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── CodeSubmission.js
│   │   │   ├── Review.js
│   │   │   ├── Deployment.js
│   │   │   ├── AuditLog.js
│   │   │   └── TerminalSession.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # /api/auth
│   │   │   ├── projects.routes.js   # /api/projects
│   │   │   ├── submissions.routes.js # /api/submissions
│   │   │   ├── reviews.routes.js    # /api/reviews
│   │   │   ├── deployments.routes.js # /api/deployments
│   │   │   └── terminal.routes.js   # /ws/terminal
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── submission.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── deployment.controller.js
│   │   │   └── terminal.controller.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js               # JWT utilities
│   │   │   ├── crypto.js            # Encryption utilities
│   │   │   ├── git-wrapper.js       # Safe git command wrapper
│   │   │   ├── diff-parser.js       # Parse git diffs
│   │   │   ├── rule-engine.js       # Validation rules
│   │   │   └── logger.js            # Logging helper
│   │   │
│   │   ├── constants/
│   │   │   ├── roles.js             # Role definitions
│   │   │   ├── status.js            # Status enums
│   │   │   └── messages.js          # User messages
│   │   │
│   │   └── app.js                   # Express app setup
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── server.js                    # Entry point
│
├── frontend/                         # React frontend (later)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPEC.md
│   ├── COMMANDS.md
│   ├── CICD_FLOW.md
│   ├── RULE_ENGINE.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── .gitignore
├── docker-compose.yml               # For local dev
├── README.md
└── package.json                     # Root package.json
```

---

## Backend package.json

```json
{
  "name": "vie-backend",
  "version": "0.1.0",
  "description": "Virtual Industry Experience - Backend",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --watch",
    "test:once": "jest",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.3",
    "socket.io": "^4.5.4",
    "nodegit": "^0.27.0",
    "pty.js": "^1.4.0",
    "xterm": "^5.1.0",
    "express-validator": "^7.0.0",
    "uuid": "^9.0.0",
    "lodash": "^4.17.21",
    "axios": "^1.3.4"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "eslint": "^8.40.0"
  }
}
```

---

## Core Service Structure

### AuthService (src/services/auth.service.js)

```javascript
class AuthService {
  async register(userData) {
    // Create new user with hashed password
    // Return JWT token
  }
  
  async login(username, password) {
    // Verify credentials
    // Return JWT token + refresh token
  }
  
  async verifyToken(token) {
    // Verify JWT validity
    // Return decoded user data
  }
  
  async refreshToken(refreshToken) {
    // Issue new access token
  }
  
  async logout(userId) {
    // Invalidate tokens (optional blacklist)
  }
}
```

### ProjectService (src/services/project.service.js)

```javascript
class ProjectService {
  async createProject(projectData, userId) {
    // Create project in DB
    // Initialize git repository
    // Create initial main branch
  }
  
  async getProject(projectId) {
    // Return project details
  }
  
  async listProjects(userId) {
    // Return all projects user has access to
  }
  
  async addMember(projectId, userId, role) {
    // Add team member to project
  }
}
```

### GitService (src/services/git.service.js)

```javascript
class GitService {
  constructor(repoPath) {
    this.repoPath = repoPath;
    // Initialize nodegit repository
  }
  
  async createBranch(branchName, baseBranch) {
    // Create new branch from base
  }
  
  async listBranches() {
    // List all branches
  }
  
  async getCurrentBranch() {
    // Get current HEAD
  }
  
  async getDiff(sourceBranch, targetBranch) {
    // Get diff between branches
    // Return structured diff data
  }
  
  async mergeAndPush(sourceBranch, targetBranch) {
    // Merge source into target
    // Push to remote
  }
  
  async getCommitHistory(branchName, limit) {
    // Get recent commits on branch
  }
}
```

### SubmissionService (src/services/submission.service.js)

```javascript
class SubmissionService {
  async createSubmission(projectId, userId, branchName) {
    // Validate rules (RuleEngine)
    // Create submission record
    // Trigger CI/CD pipeline
    // Create review request
    // Notify reviewers
  }
  
  async getSubmission(submissionId) {
    // Return submission with all details
  }
  
  async listSubmissions(projectId, filters) {
    // Return submissions with pagination
  }
  
  async rejectAndNotify(submissionId, reviewer, comments) {
    // Set submission status to REJECTED
    // Store comments
    // Notify developer
  }
}
```

### CICDService (src/services/cicd.service.js)

```javascript
class CICDService {
  async runPipeline(submissionId) {
    // Start pipeline execution
    // Execute stages sequentially
    // Update status after each stage
    // Stream logs via WebSocket
    // Handle failures gracefully
  }
  
  async simulateBuild(projectId, branch) {
    // Simulate build stage
    // Generate logs
  }
  
  async simulateTest(projectId, branch) {
    // Simulate test stage
    // Generate test results
    // Maybe run real tests
  }
  
  async getPipelineStatus(submissionId) {
    // Return current pipeline state
  }
}
```

### DeploymentService (src/services/deployment.service.js)

```javascript
class DeploymentService {
  async createDeployment(submissionId, environment, managerId) {
    // Create deployment record
    // Trigger deployment stages
    // Stream deployment progress
  }
  
  async simulateDeployment(deploymentId) {
    // Run through deployment stages
    // Update status
    // Generate logs
  }
  
  async getDeploymentStatus(deploymentId) {
    // Return current deployment state
  }
}
```

### TerminalService (src/services/terminal.service.js)

```javascript
class TerminalService {
  constructor(userId, projectId) {
    // Initialize PTY (pseudo-terminal)
    // Setup command handlers
  }
  
  async executeCommand(command) {
    // Parse vie command
    // Route to appropriate handler
    // Execute safely
    // Return structured result
  }
  
  handleVieBranch(args) {
    // Handle: vie branch <name>
    // Call GitService
  }
  
  handleVieCommit(message) {
    // Handle: vie commit "message"
    // Call GitService
  }
  
  handleViePush() {
    // Handle: vie push
    // Call SubmissionService
    // Return submission details
  }
}
```

---

## Entry Point (server.js)

```javascript
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.routes.js';
import projectRoutes from './src/routes/projects.routes.js';
import submissionRoutes from './src/routes/submissions.routes.js';
import deploymentRoutes from './src/routes/deployments.routes.js';
import terminalHandler from './src/routes/terminal.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/deployments', deploymentRoutes);

// WebSocket handlers
terminalHandler(io);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`VIE Backend running on port ${PORT}`);
});
```

---

## Environment Variables (.env.example)

```bash
# Server
NODE_ENV=development
PORT=3000
SERVER_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/vie
MONGODB_USERNAME=vie_user
MONGODB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

# Git
GIT_REPOS_BASE_PATH=/repos
GIT_AUTHOR_NAME=VIE System
GIT_AUTHOR_EMAIL=system@acmecorp.internal

# Company
COMPANY_NAME=Acme Corp
COMPANY_TIMEZONE=America/Los_Angeles

# CI/CD
CICD_TIMEOUT=900000
CICD_LOG_RETENTION_DAYS=30

# Deployment
DEPLOY_STAGING_URL=https://staging.acmecorp.internal
DEPLOY_PRODUCTION_URL=https://prod.acmecorp.internal

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Key Design Principles

1. **Separation of Concerns**: Services handle business logic, controllers handle HTTP, models handle data
2. **Git Abstraction**: All git operations wrapped in GitService, never exposed to user
3. **Rule Engine**: Centralized validation at submission time
4. **Event-Driven**: CI/CD and deployments emit events for real-time updates
5. **Audit Trail**: Every action logged to audit_log collection
6. **Error Handling**: Consistent error responses with helpful messages
7. **Security**: RBAC enforced at every endpoint
8. **Extensibility**: Easy to add new services, rules, and stages

---

## Next Steps

1. Create Mongoose models matching DATABASE_SCHEMA.md
2. Implement AuthService with JWT and RBAC
3. Implement GitService wrapper for nodegit
4. Implement SubmissionService with rule validation
5. Implement CICDService with simulated stages
6. Implement TerminalService with WebSocket
7. Create Express routes for all endpoints
8. Add error handling and logging
9. Write tests for critical paths
10. Build React frontend with terminal UI
