# Phase 4.5: End-to-End Demo Seed Guide

## Overview

Phase 4.5 extends the seed script to create a complete **Junior → Senior → Manager** submission workflow demo. This allows you to test the entire code review process end-to-end without manual API calls.

## What Gets Created

When `DEMO_SEED=true` is set, the seed script creates:

### 1. **Demo Project**
- **Name**: Demo Web App
- **Slug**: demo-project
- **Members**: Manager, Senior, and Junior developers
- **CI/CD**: Enabled with npm test command
- **Deployment**: Staging (develop) and Production (main) environments

### 2. **Internal Repository**
- **Path**: `/repositories/acme-corp/demo-project`
- **Default Branch**: main
- **Active**: Yes

### 3. **Code Submission**
- **Title**: "Add user authentication feature"
- **Description**: JWT-based authentication with RBAC
- **Submitted By**: junior1 (Junior developer)
- **Source Branch**: feature/auth-system
- **Target Branch**: develop
- **Status**: AWAITING_REVIEW (after Senior approval → AWAITING_MANAGER_APPROVAL)

### 4. **Senior Code Review**
- **Reviewer**: senior1 (Senior developer)
- **Status**: APPROVED
- **Comment**: "Great implementation! Code quality is excellent..."
- **Inline Comments**: Example feedback on specific lines
- **Timeline**: Completed 1 hour after submission

### 5. **Manager Final Review**
- **Reviewer**: manager1 (Manager)
- **Status**: APPROVED
- **Comment**: "Approved for production deployment. Well done team!"
- **Timeline**: Completed 30 minutes after Senior approval

### 6. **Workflow Progression**
```
[Junior Submits] → [Senior Reviews & Approves] → [Manager Reviews & Approves]
     ↓                      ↓                           ↓
AWAITING_REVIEW    AWAITING_MANAGER_APPROVAL    MANAGER_APPROVED
```

## Prerequisites

### 1. MongoDB Running Locally
The seed script connects to MongoDB on `localhost:27017` by default.

**Option A: Docker (Easiest)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Community Edition**
- Download: https://www.mongodb.com/try/download/community
- Install and start the MongoDB service

**Option C: MongoDB Atlas (Cloud)**
Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vie
```

### 2. Environment Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env if using Atlas or non-default MongoDB settings
```

## Running the Demo Seed

### Default Seed (No Demo Data)
```bash
npm run seed
```
Creates:
- 1 Company (Acme Corp)
- 3 Users (manager1, senior1, junior1)
- Idempotent (won't duplicate on re-run)

**Output**:
```
[INFO] Starting seed process...
[INFO] ✓ Created company: Acme Corp
[INFO] ✓ Created user: manager1 (MANAGER)
[INFO] ✓ Created user: senior1 (SENIOR)
[INFO] ✓ Created user: junior1 (JUNIOR)

Test credentials:
  Manager: manager1 / password123
  Senior:  senior1  / password123
  Junior:  junior1  / password123

You can now login via POST /auth/login
```

### Demo Seed (Full Workflow)
```bash
DEMO_SEED=true npm run seed
```

Creates the above PLUS:
- Demo Project with all 3 users as members
- Internal Repository
- Code Submission by junior1
- Senior Review (APPROVED)
- Manager Review (APPROVED)
- Full status progression

**Output**:
```
[INFO] Starting seed process...
[INFO] ✓ Created company: Acme Corp
[INFO] ✓ Created user: manager1 (MANAGER)
[INFO] ✓ Created user: senior1 (SENIOR)
[INFO] ✓ Created user: junior1 (JUNIOR)

========== DEMO MODE: Creating submission workflow ==========
[INFO] 📁 Creating demo project...
[INFO] ✓ Created demo project: Demo Web App
[INFO] 🗂️  Creating internal repository...
[INFO] ✓ Created repository at: /repositories/acme-corp/demo-project
[INFO] 📤 Creating sample submission by Junior...
[INFO] ✓ Created submission: "Add user authentication feature" (ID: xxx)
[INFO] 👁️  Creating Senior review...
[INFO] ✓ Senior review created: APPROVED
[INFO] ✓ Submission status updated to: AWAITING_MANAGER_APPROVAL
[INFO] ✅ Creating Manager final review...
[INFO] ✓ Manager review created: APPROVED
[INFO] ✓ Submission status updated to: MANAGER_APPROVED

========== DEMO WORKFLOW COMPLETE ==========
Submission Flow: JUNIOR → SENIOR → MANAGER
  Junior Submission: xxx
  Senior Review: APPROVED
  Manager Review: APPROVED
  Final Status: MANAGER_APPROVED
```

## Idempotency

The demo seed is **fully idempotent**:
- Running `DEMO_SEED=true npm run seed` multiple times won't create duplicates
- Checks for existing data before creating:
  - ✅ Company exists? Skip creation
  - ✅ Users exist? Skip creation
  - ✅ Demo project exists? Skip creation
  - ✅ Repository exists? Skip creation
  - ✅ Submission exists? Skip creation
  - ✅ Reviews exist? Skip creation

**Safe to re-run**: You can re-run the seed as many times as needed. Only missing data will be created.

## Testing the Workflow

After running the seed, you can test the API endpoints:

### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager1","password":"password123"}'
```

### 2. List Projects (As Manager)
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer <token>"
```

### 3. List Submissions (As Senior)
```bash
curl -X GET http://localhost:3000/api/submissions \
  -H "Authorization: Bearer <senior_token>"
```

### 4. List Reviews for Senior
```bash
curl -X GET http://localhost:3000/api/reviews \
  -H "Authorization: Bearer <senior_token>"
```

## File Changes in Phase 4.5

### Modified: `backend/seed.js`

**Additions**:
1. **Imports**: Added CodeSubmission, Review, Project, InternalRepository models and status constants
2. **User Fetching**: Stores manager1, senior1, junior1 references for demo creation
3. **Demo Mode Block** (Lines ~115-200):
   - Checks `process.env.DEMO_SEED === "true"`
   - Creates demo project with all 3 members
   - Creates internal repository
   - Creates code submission by junior1
   - Creates Senior review (APPROVED)
   - Updates submission to AWAITING_MANAGER_APPROVAL
   - Creates Manager review (APPROVED)
   - Updates submission to MANAGER_APPROVED
4. **Idempotency**: All creation operations check for existing records first
5. **Logging**: Detailed logging with emoji indicators for each step

**Key Code Pattern**:
```javascript
const demoMode = process.env.DEMO_SEED === "true";

if (demoMode) {
  // Create or skip demo data
  let project = await Project.findOne({ ... });
  if (!project) {
    // Create project
  } else {
    logger.info("Project already exists, skipping creation.");
  }
}
```

## Demo Scenarios

### Scenario 1: Fresh Seed
```bash
# First run: Creates everything
DEMO_SEED=true npm run seed

# Output: All data created with ✓ markers
```

### Scenario 2: Idempotent Re-run
```bash
# Second run: Skips existing data
DEMO_SEED=true npm run seed

# Output: Shows "already exists, skipping" messages
```

### Scenario 3: Add More Test Data
```bash
# Clear database and start fresh (if needed)
# MongoDB: db.companies.deleteMany({})
# Then: npm run seed
```

## Verification Checklist

After running `DEMO_SEED=true npm run seed`, verify in MongoDB:

- [ ] **Company**: 1 company named "Acme Corp"
- [ ] **Users**: 3 users (manager1, senior1, junior1)
- [ ] **Project**: 1 project "Demo Web App" with 3 members
- [ ] **Repository**: 1 internal repository for the project
- [ ] **Submission**: 1 submission by junior1 with status "MANAGER_APPROVED"
- [ ] **Reviews**: 2 reviews (1 SENIOR, 1 MANAGER), both APPROVED

**MongoDB Queries**:
```javascript
// Check data
db.companies.find()
db.users.find({}, {password: 0})
db.projects.find()
db.internalrepositories.find()
db.codesubmissions.find()
db.reviews.find()
```

## Troubleshooting

### Issue: "Cannot find package 'mongoose'"
**Solution**: Run `npm install` in the backend directory
```bash
cd backend && npm install
```

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:27017"
**Solution**: Start MongoDB
```bash
# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Community Edition service
```

### Issue: "DEMO_SEED=true not recognized"
**Solution**: Use proper environment variable syntax for your shell
```bash
# PowerShell
$env:DEMO_SEED="true"; npm run seed

# Bash/Linux
DEMO_SEED=true npm run seed
```

### Issue: Script hangs with no output
**Solution**: Check MongoDB connection
1. Verify MongoDB is running: `mongo --version` or `mongosh --version`
2. Test connection: `mongosh mongodb://localhost:27017`
3. Check .env MONGODB_URI setting
4. View logs: Add more logging to database.js if needed

## Next Steps

After Phase 4.5, consider:

1. **Phase 5**: CI/CD Pipeline Simulation
   - Add build/test stages to submissions
   - Track CI status in UI
   - Automated deployment on approval

2. **Frontend Dashboard**
   - React app to visualize workflow
   - Real-time submission/review updates
   - Team collaboration features

3. **Advanced Features**
   - Multiple submission strategies (draft, WIP, ready)
   - Inline code comments UI
   - Deployment rollback mechanism
   - Approval history and audit logs

## Summary

Phase 4.5 makes VIE's core workflow tangible and testable. Run `DEMO_SEED=true npm run seed` once, and you have a complete end-to-end junior-to-manager approval flow ready to explore and extend.

