# VIE CI/CD SIMULATION FLOW

## Overview

CI/CD must FEEL real and consequential, but may be simulated initially. Users must experience:
- Realistic execution times
- Actual test results
- Stage progression
- Failure handling
- Meaningful logs

---

## Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CODE SUBMISSION TRIGGERED                     │
│                   (vie push from Junior Dev)                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
            ┌────────────────▼────────────────┐
            │   PRE-PIPELINE VALIDATION       │
            │ - Check branch (not main)       │
            │ - Validate rules                │
            │ - Check for conflicts           │
            └────────────────┬────────────────┘
                             │ (pass)
        ┌────────────────────▼────────────────────┐
        │         PIPELINE STARTED                │
        │   Submission status: CI_RUNNING         │
        │   User sees: "Running tests..."         │
        └────────────────┬───────────────────────┘
                         │
      ┌──────────────────▼──────────────────┐
      │         STAGE 1: BUILD              │
      │ - Compile TypeScript (if applicable)│
      │ - Install dependencies              │
      │ - Check syntax                      │
      │ Duration: 30s - 2min                │
      └──────────────────┬──────────────────┘
                         │ (pass)
      ┌──────────────────▼──────────────────┐
      │         STAGE 2: LINT               │
      │ - ESLint / Prettier                 │
      │ - Code style check                  │
      │ Duration: 15s - 1min                │
      └──────────────────┬──────────────────┘
                         │ (pass)
      ┌──────────────────▼──────────────────┐
      │        STAGE 3: UNIT TESTS          │
      │ - Run Jest / Mocha                  │
      │ - Execute test suite                │
      │ Duration: 1min - 10min              │
      │ Results: # passed / # failed        │
      └──────────────────┬──────────────────┘
                         │
            pass│        │fail
                │        │
      ┌─────────▼──┐  ┌──▼──────────────┐
      │ STAGE 4:   │  │  PIPELINE FAILED │
      │ INTEGRATION│  │ Submission status:│
      │ TESTS      │  │ CI_FAILED        │
      │ Duration:  │  │ User sees error  │
      │ 1min-3min  │  └─────────┬────────┘
      └──────┬─────┘            │
             │ (pass)           │
      ┌──────▼────────────────┐ │
      │   TESTS PASSED        │ │
      │ Status: CI_PASSED     │ │
      │ Move to REVIEW        │ │ Notification
      │ Assign reviewer       │ │ sent to
      │ Status:               │ │ Junior Dev
      │ AWAITING_REVIEW       │ │ with logs
      └───────────────────────┘ │
                                │
      ┌─────────────────────────▼─────────────────┐
      │  JUNIOR DEV FIXES CODE & RE-PUSHES        │
      │  Pipeline runs again for fixed code       │
      └───────────────────────────────────────────┘
```

---

## Pipeline Stages (Detailed)

### Stage 1: Build

**Purpose**: Compile code and check for syntax errors

**For Node.js/JavaScript:**
```bash
npm ci
npm run build  # if applicable (TypeScript compilation)
```

**For TypeScript:**
```bash
npx tsc --noEmit  # type checking
```

**Simulated Output:**
```
[16:22:15] Build started...
[16:22:16] Installing dependencies...
[16:22:35] npm packages installed (234 packages)
[16:22:36] Compiling TypeScript...
[16:22:48] Type checking complete
[16:22:49] ✓ Build successful (34s)
```

**Possible Failures:**
- Missing dependencies
- TypeScript compilation errors
- Circular imports
- Configuration errors

**Failure Message:**
```
[16:22:15] Build started...
[16:22:16] Installing dependencies...
[16:22:35] npm packages installed (234 packages)
[16:22:36] Compiling TypeScript...
[16:22:51] ERROR: Type error in src/auth/oauth.js
           Cannot find module 'oauth2-server'
[16:22:52] ✗ Build failed (37s)

Fix: Run 'npm install oauth2-server' and push again
```

---

### Stage 2: Linting & Code Style

**Purpose**: Enforce code quality standards

**Tools:**
- ESLint
- Prettier
- TypeScript strict mode

**Simulated Output:**
```
[16:23:15] Linting started...
[16:23:20] Running ESLint on 156 files...
[16:23:35] ✓ No linting errors found
[16:23:36] Checking code formatting...
[16:23:40] ✓ All files properly formatted
[16:23:41] ✓ Lint check passed (26s)
```

**Possible Failures:**
```
[16:23:15] Linting started...
[16:23:20] Running ESLint on 156 files...
[16:23:32] ERROR in src/auth/oauth.js:45:2
          'authToken' is assigned a value but never used (no-unused-vars)
[16:23:33] ERROR in src/user.js:120:1
          Missing semicolon (semi)
[16:23:34] ✗ Lint failed (19s)

Fix errors above and re-push
```

---

### Stage 3: Unit Tests

**Purpose**: Verify functionality with automated tests

**Tools:**
- Jest, Mocha, or similar
- Coverage reporting

**Simulated Output:**
```
[16:24:15] Running unit tests...
[16:24:16] Test suite: Auth Service
[16:24:18]   ✓ Should authenticate valid user (42ms)
[16:24:19]   ✓ Should reject invalid password (38ms)
[16:24:20]   ✓ Should refresh token (35ms)
[16:24:21]   ✓ Should logout user (28ms)
[16:24:22] Test suite: User Controller
[16:24:24]   ✓ Should fetch user profile (45ms)
[16:24:25]   ✓ Should update user profile (52ms)
[16:24:26]   ✓ Should delete user (38ms)
...
[16:25:45] ============ Test Results ============
[16:25:45] Tests:     234 passed, 0 failed
[16:25:45] Coverage:  85% statements, 78% branches
[16:25:45] Duration:  90 seconds
[16:25:46] ✓ Tests passed (91s)
```

**Possible Failures:**
```
[16:24:15] Running unit tests...
[16:24:16] Test suite: Auth Service
[16:24:18]   ✓ Should authenticate valid user (42ms)
[16:24:19]   ✗ Should reject invalid password (1234ms)
           Expected: false
           Received: true
[16:24:20]   ✓ Should refresh token (35ms)
...
[16:25:45] ============ Test Results ============
[16:25:45] Tests:     231 passed, 3 failed
[16:25:45] Failed tests:
          - Auth Service :: Should reject invalid password
          - User Controller :: Should delete user
          - User Controller :: Should update user profile
[16:25:46] ✗ Tests failed (91s)

View your code and fix the failing tests
```

**Coverage Report:**
```
File                  | Coverage
─────────────────────────────────
src/auth/oauth.js     | 92%
src/auth/jwt.js       | 88%
src/controllers/auth  | 85%
src/user.js           | 78%
src/db/index.js       | 65%
─────────────────────────────────
TOTAL                 | 85%
```

---

### Stage 4: Integration Tests (Optional)

**Purpose**: Test interactions between components

**Simulated Output:**
```
[16:26:15] Running integration tests...
[16:26:20] API Integration Tests
[16:26:25]   ✓ POST /api/auth/login → 200 OK (156ms)
[16:26:26]   ✓ GET /api/users/me → 401 without token (45ms)
[16:26:27]   ✓ GET /api/users/me → 200 with token (78ms)
[16:26:28]   ✓ POST /api/users → creates user (234ms)
...
[16:27:30] ✓ Integration tests passed (75s)
```

---

## Pipeline Configuration

### Default Configuration

```javascript
{
  projectId: "proj_123",
  pipeline: {
    enabled: true,
    
    stages: [
      {
        name: "build",
        enabled: true,
        timeout: "5 minutes",
        command: "npm run build",
        allowFailure: false,
      },
      {
        name: "lint",
        enabled: true,
        timeout: "3 minutes",
        command: "npm run lint",
        allowFailure: false,
      },
      {
        name: "test",
        enabled: true,
        timeout: "15 minutes",
        command: "npm test",
        allowFailure: false,
        coverage: {
          enabled: true,
          minimum: 80,
          reportCoverage: true,
        }
      },
      {
        name: "integration",
        enabled: false, // Can enable later
        timeout: "10 minutes",
        command: "npm run test:integration",
        allowFailure: false,
      }
    ],
    
    // Notifications
    notifications: {
      onSuccess: true,
      onFailure: true,
      successMessage: "All tests passed! Code is ready for review.",
      failureMessage: "Tests failed. Please review the logs and fix the issues.",
    }
  }
}
```

---

## CI Pipeline States

### PENDING
User has just pushed code.
```json
{
  "status": "PENDING",
  "message": "Pipeline has been queued. Starting in a moment...",
  "estimatedStartTime": "2025-01-30T16:22:30Z"
}
```

### RUNNING
Pipeline is actively executing a stage.
```json
{
  "status": "RUNNING",
  "currentStage": "test",
  "progress": 65,
  "message": "Running tests... (2m 15s elapsed)",
  "stages": [
    { "name": "build", "status": "COMPLETED", "duration": "34s" },
    { "name": "lint", "status": "COMPLETED", "duration": "26s" },
    { "name": "test", "status": "IN_PROGRESS", "duration": "2m 15s" }
  ]
}
```

### PASSED
All stages completed successfully.
```json
{
  "status": "PASSED",
  "message": "All pipeline stages passed successfully!",
  "duration": "3m 15s",
  "stages": [
    { "name": "build", "status": "PASSED", "duration": "34s" },
    { "name": "lint", "status": "PASSED", "duration": "26s" },
    { "name": "test", "status": "PASSED", "duration": "2m 15s" }
  ],
  "nextStep": "Code is ready for review. A Senior Developer will review shortly."
}
```

### FAILED
One or more stages failed.
```json
{
  "status": "FAILED",
  "message": "Pipeline failed at stage: test",
  "failedStage": "test",
  "failureReason": "3 tests failed",
  "stages": [
    { "name": "build", "status": "PASSED", "duration": "34s" },
    { "name": "lint", "status": "PASSED", "duration": "26s" },
    { "name": "test", "status": "FAILED", "duration": "3m 12s" }
  ],
  "nextStep": "Fix the failing tests and push again.",
  "logs": "..."
}
```

---

## Real-time Streaming

Users see live updates as pipeline progresses via WebSocket.

**Message Types:**

### STAGE_STARTED
```json
{
  "type": "STAGE_STARTED",
  "stage": "test",
  "timestamp": "2025-01-30T16:24:15Z"
}
```

### LOG_LINE
```json
{
  "type": "LOG_LINE",
  "line": "[16:24:18]   ✓ Should authenticate valid user (42ms)",
  "level": "INFO",
  "timestamp": "2025-01-30T16:24:18Z"
}
```

### STAGE_COMPLETED
```json
{
  "type": "STAGE_COMPLETED",
  "stage": "test",
  "status": "PASSED",
  "duration": "91s",
  "timestamp": "2025-01-30T16:25:46Z"
}
```

### PIPELINE_FAILED
```json
{
  "type": "PIPELINE_FAILED",
  "failedStage": "test",
  "reason": "3 tests failed",
  "timestamp": "2025-01-30T16:25:50Z"
}
```

### PIPELINE_COMPLETED
```json
{
  "type": "PIPELINE_COMPLETED",
  "status": "PASSED",
  "duration": "3m 15s",
  "timestamp": "2025-01-30T16:26:00Z"
}
```

---

## Simulated vs Real Execution

### For MVP (Simulated)

**Pros:**
- Fast development
- Predictable results
- Easy to test flows
- No infrastructure needed

**Approach:**
- Pre-generate realistic logs
- Use timeouts to simulate stage durations
- Hardcode success/failure based on rules
- Can inject random failures occasionally

**Example:**
```javascript
async function runLintStage(submission) {
  // Simulate lint stage
  const duration = 15000 + Math.random() * 10000; // 15-25 seconds
  
  await sleep(duration);
  
  // Check for obvious issues (could be real)
  const hasEslintIssues = hasLintViolations(submission);
  
  if (hasEslintIssues) {
    return {
      status: "FAILED",
      logs: generateLintFailureLogs(submission),
      errors: getLintViolations(submission)
    };
  }
  
  return {
    status: "PASSED",
    logs: generateLintPassLogs(),
    duration: duration
  };
}
```

### Future (Real Execution)

**Hook to real commands:**
```javascript
async function runTestStage(submission) {
  // Real command execution
  const result = await execCommand(
    `cd /repos/${submission.projectId} && npm test`,
    { timeout: 15 * 60 * 1000 }
  );
  
  return parseTestResults(result);
}
```

---

## Failure Handling & Retry

When pipeline fails, user gets:

1. **Clear error message** with which stage failed
2. **Detailed logs** showing exact error
3. **Actionable suggestions** on how to fix
4. **Ability to retry** by pushing fixes

Example flow:
```
Junior Dev pushes code
     ↓
Pipeline runs → Tests fail (3 failures)
     ↓
Junior Dev sees: "Tests failed. View logs: vie submission view sub_789"
     ↓
Junior Dev reads error, fixes code locally
     ↓
Junior Dev commits fix: vie commit "Fix failing auth tests"
     ↓
Junior Dev re-pushes: vie push
     ↓
Pipeline runs again → Tests pass
     ↓
Code moves to review
```

---

## Logging Standards

All pipeline logs follow this format for consistency:

```
[HH:MM:SS] Message
[HH:MM:SS] ✓ Success indicator
[HH:MM:SS] ✗ Failure indicator
[HH:MM:SS] > Nested output
[HH:MM:SS] ERROR: Error message
[HH:MM:SS] WARNING: Warning message
```

Example:
```
[16:22:15] Build started...
[16:22:16] > Installing dependencies
[16:22:16]   npm version 9.8.1
[16:22:16] > Running: npm ci
[16:22:35] ✓ npm packages installed (234 packages, 8.2MB)
[16:22:36] > Compiling TypeScript
[16:22:48] ✓ TypeScript compilation successful
[16:22:49] ✓ Build completed successfully (34s)
```
