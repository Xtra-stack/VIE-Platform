# VIE RULE ENGINE DESIGN

## Overview

The Rule Engine enforces validation at multiple stages:
1. **Commit-time validation** - Before code is committed
2. **Push-time validation** - Before code is submitted for review
3. **CI-time validation** - During automated test execution
4. **Review-time validation** - Before senior dev can approve
5. **Deployment-time validation** - Before manager can deploy

---

## Rule Categories

### 1. Commit Message Rules

#### Format & Length
```javascript
{
  id: "commit-message-length",
  name: "Commit Message Length",
  enabled: true,
  minLength: 10,
  maxLength: 100,
  enforcement: "STRICT", // or WARN
  message: "Commit message must be between 10-100 characters",
  
  validate: (message) => {
    return message.length >= 10 && message.length <= 100;
  }
}
```

#### Blocked Keywords
```javascript
{
  id: "blocked-keywords",
  name: "Blocked Keywords",
  enabled: true,
  keywords: ["TODO", "FIXME", "WIP", "HACK", "TEMP"],
  enforcement: "STRICT",
  message: "Commit message contains blocked keywords: {{keywords}}",
  
  validate: (message) => {
    return !keywords.some(kw => message.toUpperCase().includes(kw));
  }
}
```

#### Required Keywords/Format
```javascript
{
  id: "commit-format",
  name: "Commit Format",
  enabled: true,
  pattern: /^(feat|fix|refactor|chore|docs|style|test):\s.{8,}$/, // Conventional Commits
  enforcement: "WARN",
  message: "Consider using conventional commits: feat: description, fix: description, etc.",
  
  validate: (message) => {
    return pattern.test(message);
  }
}
```

---

### 2. File & Directory Rules

#### Allowed File Extensions
```javascript
{
  id: "allowed-extensions",
  name: "Allowed File Extensions",
  enabled: true,
  allowedExtensions: [".js", ".ts", ".json", ".md", ".yml", ".yaml"],
  blockedExtensions: [".exe", ".dll", ".bin", ".o"],
  enforcement: "STRICT",
  
  validate: (files) => {
    return files.every(file => {
      const ext = Path.extname(file);
      return allowedExtensions.includes(ext);
    });
  }
}
```

#### Max File Size
```javascript
{
  id: "max-file-size",
  name: "Maximum File Size",
  enabled: true,
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  enforcement: "STRICT",
  message: "File {{file}} exceeds maximum size of 10 MB",
  
  validate: (file, size) => {
    return size <= maxSizeBytes;
  }
}
```

#### Sensitive Files Protection
```javascript
{
  id: "sensitive-files",
  name: "Sensitive Files Protection",
  enabled: true,
  blockedPaths: [".env", ".secrets", "config/database.js", "src/keys"],
  enforcement: "STRICT",
  message: "Cannot modify sensitive files: {{paths}}",
  
  validate: (files) => {
    return !files.some(file => 
      blockedPaths.some(blocked => file.includes(blocked))
    );
  }
}
```

#### Binary File Detection
```javascript
{
  id: "binary-files",
  name: "No Binary Files",
  enabled: true,
  enforcement: "STRICT",
  message: "Binary files are not allowed: {{files}}",
  
  validate: (files) => {
    return !files.some(file => isBinaryFile(file));
  }
}
```

---

### 3. Code Quality Rules

#### File Change Limits
```javascript
{
  id: "max-files-per-commit",
  name: "Maximum Files Per Commit",
  enabled: true,
  maxFiles: 20,
  enforcement: "WARN",
  message: "Large changeset ({{count}} files). Consider breaking into smaller commits.",
  
  validate: (files) => {
    return files.length <= maxFiles;
  }
}
```

#### Line Change Limits
```javascript
{
  id: "max-lines-per-commit",
  name: "Maximum Line Changes",
  enabled: true,
  maxAdditions: 500,
  maxDeletions: 500,
  enforcement: "WARN",
  message: "Large changeset ({{additions}} additions, {{deletions}} deletions). Consider breaking into smaller commits.",
  
  validate: (diff) => {
    return diff.additions <= maxAdditions && diff.deletions <= maxDeletions;
  }
}
```

#### Duplicate Code Detection
```javascript
{
  id: "duplicate-code",
  name: "Duplicate Code Check",
  enabled: false, // Can be expensive
  enforcement: "WARN",
  message: "Found {{count}} duplicate code blocks",
  
  validate: (files) => {
    // Use tool like jscpd
  }
}
```

---

### 4. Branch Rules

#### Protected Branch Rules
```javascript
{
  id: "main-branch-protection",
  name: "Main Branch Protection",
  branch: "main",
  
  rules: {
    allowDirectPush: false, // Must go through PR/review
    requireApprovalCount: 1, // Minimum reviews
    dismissStaleReviews: true,
    requireStatusChecks: true, // Must pass CI
    requireRoleForPush: ["MANAGER"], // Only managers can push
  }
}
```

#### Feature Branch Naming
```javascript
{
  id: "branch-naming",
  name: "Feature Branch Naming Convention",
  enabled: true,
  enforcement: "WARN",
  pattern: /^(feature|bugfix|hotfix|refactor|docs|chore)\/.{3,}$/,
  message: "Branch name should follow: feature/description or bugfix/description",
  
  validate: (branchName) => {
    return pattern.test(branchName);
  }
}
```

---

### 5. Submission Rules

#### Submission Completeness
```javascript
{
  id: "submission-title",
  name: "Submission Title Required",
  enabled: true,
  enforcement: "STRICT",
  message: "Submission must have a clear title/description",
  
  validate: (submission) => {
    return submission.title && submission.title.length >= 10;
  }
}
```

#### Minimum Commit Count
```javascript
{
  id: "min-commits",
  name: "Minimum Commits in Submission",
  enabled: true,
  minCommits: 1,
  enforcement: "WARN",
  message: "Consider squashing minor commits or breaking larger changes into separate submissions",
  
  validate: (submission) => {
    return submission.commits.length >= minCommits;
  }
}
```

---

### 6. Review Rules

#### Auto-Approval Rules
```javascript
{
  id: "auto-approval-trivial",
  name: "Auto-Approve Trivial Changes",
  enabled: true,
  
  rules: [
    {
      name: "Documentation only",
      match: (submission) => {
        return submission.filesChanged.every(f => f.endsWith('.md'));
      },
      autoApprove: true,
      notify: true,
    },
    {
      name: "Configuration files",
      match: (submission) => {
        return submission.filesChanged.every(f => f.match(/\.json|\.yml|\.yaml/));
      },
      autoApprove: true,
      notify: true,
    }
  ]
}
```

---

### 7. CI/CD Rules

#### Required CI Status
```javascript
{
  id: "ci-must-pass",
  name: "CI Pipeline Must Pass",
  enabled: true,
  enforcement: "STRICT",
  stages: [
    {
      name: "build",
      required: true,
      timeout: "5m"
    },
    {
      name: "test",
      required: true,
      timeout: "10m",
      minPassRate: 100, // 100% tests must pass
    },
    {
      name: "lint",
      required: true,
      timeout: "3m"
    }
  ],
  message: "All CI stages must pass before review can proceed"
}
```

#### Code Coverage Requirements
```javascript
{
  id: "min-coverage",
  name: "Minimum Code Coverage",
  enabled: false, // Optional for MVP
  enforcement: "WARN",
  minCoverage: 80,
  message: "Code coverage is {{coverage}}%. Target: {{minCoverage}}%",
  
  validate: (coverageReport) => {
    return coverageReport.totalCoverage >= minCoverage;
  }
}
```

---

### 8. Deployment Rules

#### Pre-Deployment Validation
```javascript
{
  id: "pre-deploy-checks",
  name: "Pre-Deployment Checks",
  enabled: true,
  enforcement: "STRICT",
  
  checks: [
    {
      name: "All reviews completed",
      validate: (submission) => {
        return submission.reviewStatus === "APPROVED";
      }
    },
    {
      name: "All CI stages passed",
      validate: (submission) => {
        return submission.ciStatus === "PASSED";
      }
    },
    {
      name: "No conflicts with main branch",
      validate: (submission) => {
        return !submission.hasConflicts;
      }
    }
  ]
}
```

#### Environment-Specific Rules
```javascript
{
  id: "env-staging-rules",
  name: "Staging Environment Rules",
  environment: "STAGING",
  
  rules: {
    autoDeployOnApproval: true,
    allowMultipleDeploysPerDay: true,
    requireSecurityReview: false,
  }
}

{
  id: "env-prod-rules",
  name: "Production Environment Rules",
  environment: "PRODUCTION",
  
  rules: {
    autoDeployOnApproval: false,
    requireManagerApproval: true,
    requireSecurityReview: false, // Can enable later
    allowDeploymentWindow: {
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri only
      hoursOfDay: [9, 10, 11, 12, 13, 14, 15, 16, 17], // 9 AM - 5 PM
    },
    requireChangeTicket: false,
  }
}
```

---

## Rule Engine Implementation

### Rule Registry
```javascript
class RuleEngine {
  constructor() {
    this.rules = new Map();
    this.registerDefaultRules();
  }
  
  registerRule(rule) {
    this.rules.set(rule.id, rule);
  }
  
  registerDefaultRules() {
    // Register all rules defined above
  }
  
  validateCommit(projectId, commitMessage, files, diff) {
    const project = getProject(projectId);
    const rules = project.validationRules;
    
    const violations = [];
    const warnings = [];
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      const result = rule.validate(/* data */);
      
      if (!result) {
        const violation = {
          ruleId: rule.id,
          name: rule.name,
          message: rule.message,
          enforcement: rule.enforcement
        };
        
        if (rule.enforcement === "STRICT") {
          violations.push(violation);
        } else {
          warnings.push(violation);
        }
      }
    }
    
    return {
      valid: violations.length === 0,
      violations,
      warnings,
      canProceed: violations.length === 0
    };
  }
  
  validatePush(projectId, submission) {
    // Validate all aspects of the submission
  }
  
  validateCanReview(projectId, reviewer, submission) {
    // Check if reviewer can review this submission
  }
  
  validateCanDeploy(projectId, deployment, manager) {
    // Check if all pre-deployment checks pass
  }
}
```

### Rule Violation Response
```javascript
{
  success: false,
  error: "Code push rejected",
  violations: [
    {
      ruleId: "commit-message-length",
      name: "Commit Message Length",
      message: "Commit message must be between 10-100 characters",
      commitHash: "abc123",
      commitMessage: "Fix bug",
      suggestion: "Use: vie commit \"Fix authentication bug in login flow\""
    }
  ],
  warnings: [
    {
      ruleId: "max-files-per-commit",
      name: "Maximum Files Per Commit",
      message: "Large changeset (15 files). Consider breaking into smaller commits.",
      severity: "WARN"
    }
  ],
  action: "FIX_AND_RETRY"
}
```

---

## Rule Customization Per Project

Projects can override default rules:

```javascript
{
  projectId: "proj_123",
  overrides: {
    "commit-message-length": {
      minLength: 15, // Override default of 10
      enabled: true
    },
    "branch-naming": {
      enabled: false // Disable for this project
    },
    "custom-rule-1": {
      // Add custom rules
      pattern: /custom/,
      enabled: true
    }
  }
}
```

---

## Audit & Analytics

All rule violations and validations are logged:

```javascript
{
  timestamp: Date,
  projectId: ObjectId,
  userId: ObjectId,
  action: "VALIDATION_FAILED",
  ruleId: String,
  ruleName: String,
  enforcement: "STRICT|WARN",
  violation: Object,
  submissionId: ObjectId,
}
```

This allows tracking which rules are most frequently violated and which can be relaxed or removed.
