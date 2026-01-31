# VIE SYSTEM MESSAGES & UX GUIDELINES

## Design Philosophy

All messages must feel like they're coming from a **real internal company system**, not from a learning platform.

- ✅ Professional, direct language
- ✅ Show exactly what happened and why
- ✅ Provide actionable next steps
- ✅ Use consistent formatting
- ❌ Avoid condescending tone
- ❌ No emojis or cutesy language
- ❌ No vague messages

---

## Message Categories

### Success Messages

#### Code Submission Success

```
✓ Your code has been submitted for review

Branch: feature-login
Target: main
Commits: 2
Files changed: 5 (+234, -45)

Next steps:
• Automated tests will run immediately (usually 3-5 minutes)
• Results will appear in your submission dashboard
• Once tests pass, a Senior Developer will review your code

Track your submission: vie submission view sub_789
```

#### Code Approved by Senior

```
✓ Your submission has been approved

Reviewer: Sarah Chen
Approved at: Jan 30, 2025 4:45 PM
Review time: 1h 23m

Next step:
Your code is now waiting for final approval from a Manager.
This typically takes 1-2 hours during business hours.

Code path: feature-login → main
```

#### Manager Approved & Deployment Started

```
✓ Code approved and deployment started

Approved by: Manager Name
Deployment ID: dep_456
Environment: STAGING
Estimated duration: 15 minutes

You can view the deployment progress in your dashboard:
vie deployment status dep_456

Or stream live logs:
vie deployment logs dep_456 --follow
```

#### Deployment Successful

```
✓ Deployment completed successfully

Environment: STAGING
Duration: 14 minutes 32 seconds
Deployment ID: dep_456

What was deployed:
• 2 commits
• 5 files changed
• Build time: 2m 15s
• Test time: 8m 30s
• Migration time: 3m 47s

Your code is now live in staging. Verify functionality and let
your team know if you need any adjustments.

Deployment logs: vie deployment logs dep_456
```

---

### Error Messages

#### Cannot Push to Main Branch

```
✗ Code push rejected: Branch protection violated

You are trying to push to: main
Your role allows: feature branches only

Why this matters:
Main branch is protected to ensure stability. Only Managers can
merge code to main after Senior Developer review.

What you should do:
1. Switch to your feature branch:
   vie branch switch feature-login
   
2. Push from your feature branch:
   vie push
   
3. Your code will be reviewed before merging to main

Current branch: main
Available branches: vie branch list
```

#### Validation Rules Failed

```
✗ Code push rejected: Validation rules failed

Your commit messages don't meet project requirements:

Failed rule: Commit Message Length
  ❌ "Fix bug" (6 characters)
  ✓ Must be at least 10 characters

Failed rule: Blocked Keywords
  ❌ Commit: "TODO: Add error handling"
  ✓ Cannot use: TODO, FIXME, WIP

How to fix:
1. View what you changed:
   vie status
   
2. Amend your last commit with a proper message:
   vie commit "Fix authentication bug in login flow"
   
3. Push again:
   vie push

Need help? Read the project rules:
vie project info
```

#### CI/CD Pipeline Failed

```
✗ Automated tests failed (3 failures)

Submission ID: sub_789
Tests run: 234
Failures: 3

Failed tests:
  ❌ AuthService.js
     - "Should reject invalid password" (line 89)
  ❌ UserController.js
     - "Should delete user" (line 156)
  ❌ UserController.js
     - "Should update user profile" (line 142)

View detailed logs:
vie submission view sub_789

To fix:
1. Read the test failures above
2. Update your code to fix the issues
3. Run tests locally: npm test
4. Commit your fixes:
   vie commit "Fix failing authentication tests"
5. Push again:
   vie push

Your code cannot be reviewed until all tests pass.
```

#### Senior Developer Rejected Submission

```
✗ Code rejected by Senior Developer

Reviewer: John Smith
Rejected at: Jan 30, 2025 3:22 PM

Feedback:
"Good implementation overall, but we need error handling for OAuth
failures. Also please add validation for edge cases before merging."

Inline comments: 2
View all feedback: vie submission view sub_789

What to do:
1. Address the feedback in your code
2. Commit your changes:
   vie commit "Add OAuth error handling and edge case validation"
3. Push again:
   vie push

Your code will go back to the review queue. Different reviewer may review next.
```

#### Insufficient Permissions

```
✗ Operation not permitted: Insufficient permissions

You are: Junior Developer
Required: Manager or higher

What you tried: Deploy code to production
Allowed for your role:
  ✓ Write and commit code
  ✓ Push code for review
  ✓ View deployment progress
  ✗ Trigger deployments
  ✗ Approve code reviews
  ✗ Merge to main branch

Next step:
Your submission has been approved and is in the deployment queue.
A Manager will trigger the deployment when ready.

Submission status: vie submission view sub_789
```

#### Git Conflict Detected

```
✗ Cannot push code: Conflicts detected

Your code conflicts with recent changes on main branch.

Conflicting files:
  • src/auth/oauth.js (1 conflict)
  • src/user.js (2 conflicts)

How to resolve:
1. Sync with latest main:
   vie branch sync main
   
2. Resolve conflicts in the conflicting files above
   (Your editor will mark conflict sections)
   
3. Commit the resolved merge:
   vie commit "Merge main and resolve conflicts"
   
4. Push again:
   vie push

Need help? The conflicts are in your code editor, look for <<<<<<< markers.
```

#### Deployment Failed

```
✗ Deployment failed

Deployment ID: dep_456
Environment: STAGING
Failed at: Database migration stage
Duration: 4 minutes 23 seconds

Error:
"Migration 'add_user_profiles_table.js' failed: Table already exists"

Stages completed:
  ✓ Pre-deploy checks (2m)
  ✓ Pulling code (1m)
  ✗ Database migration (1m 23s) ← Failed here

Logs (last 20 lines):
[17:02:15] Running migration: add_user_profiles_table.js
[17:02:18] Creating table user_profiles...
[17:02:19] ERROR: Table 'user_profiles' already exists in database
[17:02:20] Migration failed. Exiting.

What happened:
The migration tried to create a table that already exists. This
can happen if a previous deployment partially completed.

Next steps:
Contact DevOps team or Manager to investigate the database state.
May need to:
1. Rollback previous deployment
2. Fix migration script
3. Re-deploy

Manager can retry deployment:
vie deployment logs dep_456
```

---

### Informational Messages

#### Submission Status - Awaiting Review

```
→ Awaiting Code Review

Submission ID: sub_789
Branch: feature-login
CI Status: ✓ All tests passed

Reviewers assigned: 1
  • Sarah Chen (Senior Developer) - review requested at 4:35 PM

Estimated review time: 1-2 hours

Your code is in the queue for review. Senior Developers typically
review during business hours (9 AM - 5 PM PST).

Check status: vie submission view sub_789
```

#### Deployment Progress - In Progress

```
→ Deployment in progress (65%)

Deployment ID: dep_456
Environment: STAGING
Started at: Jan 30, 2025 5:00 PM
Elapsed: 9 minutes 45 seconds

Current stage: Running migrations
Estimated remaining: 5 minutes

Completed stages:
  ✓ Pre-deploy checks (2m)
  ✓ Pulling code (1m)
  ✓ Building application (4m 30s)

Upcoming stages:
  → Database migration (est. 5m)
  → Smoke tests (est. 3m)

View live logs: vie deployment logs dep_456 --follow
```

#### Awaiting Manager Approval

```
→ Awaiting Manager Approval

Submission ID: sub_789
Branch: feature-login
Senior review: ✓ Approved by Sarah Chen at 2:45 PM

Manager assignment: Pending
Estimated wait: 2-4 hours

Your code has passed Senior Developer review and is now in the
Manager approval queue. Once a Manager approves, deployment will
be triggered automatically.

Managers typically work: 9 AM - 6 PM PST

Check status: vie submission view sub_789
```

---

## Command-Specific Messages

### Branch Creation Success

```
vie branch create feature-user-dashboard

✓ Feature branch created

Branch name: feature-user-dashboard
Based on: main
Created at: Jan 30, 2025 4:22 PM
Switched to: feature-user-dashboard

You are now on feature-user-dashboard and can start making changes.
When ready, commit your code and push for review:

  vie commit "Your changes"
  vie push
```

### Status Output

```
vie status

Current project: Backend API
Current branch: feature-login
Branch status: Clean (no uncommitted changes)

Recent commits:
  • abc123 - Add OAuth2 login flow (1 hour ago)
  • def456 - Setup auth service (3 hours ago)

Your submissions:
  • sub_789 - AWAITING_REVIEW (pending 1h 45m)
  • sub_788 - APPROVED (3 days ago)

No uncommitted changes. Ready to create a new commit.
```

### Commit Success

```
vie commit "Add OAuth2 login flow"

✓ Changes committed successfully

Commit hash: abc123def456
Message: Add OAuth2 login flow
Files changed: 3
Insertions: +234
Deletions: -45

Your changes are saved locally. They will be submitted when you run:
  vie push

Not ready to push? Keep working and make more commits:
  vie status
  [edit files]
  vie commit "Next change"
```

### Push Success

```
vie push

✓ Code submitted for review!

Submission ID: sub_789
Branch: feature-login
Target: main
Commits: 2
Files changed: 5

Next steps:
→ Automated tests running (est. 3-5 minutes)
→ Code review queued after tests pass
→ Manager approval after senior review

Real-time updates: vie submission view sub_789
```

---

## Review Interface Messages

### As Senior Developer - Code to Review

```
You have 3 code reviews pending

Review Queue:
1. feature-login (AWAITING_REVIEW)
   • By: Ajay Patel
   • Submitted: Today at 2:22 PM
   • Tests: ✓ Passed (234 tests)
   • Files: 5 changed

2. bugfix-auth-error (AWAITING_REVIEW)
   • By: Sarah Johnson
   • Submitted: Today at 1:15 PM
   • Tests: ✓ Passed (234 tests)
   • Files: 3 changed

[Review the first one]
```

### Review Result - Approved

```
Code Review Complete

Branch: feature-login
Submission: sub_789
Decision: APPROVED ✓
Reviewed by: Sarah Chen
Time spent: 1 hour 23 minutes
Review comments: 2 inline comments

Review summary:
"Good implementation overall. OAuth2 flow is clean and well-tested.
Minor suggestion about error handling in edge cases, but not blocking."

Next step:
This submission is now sent to Manager for final approval.
Deployment will be triggered once Manager approves.

Status: AWAITING_MANAGER_APPROVAL
```

### Review Result - Rejected

```
Code Review Rejected

Branch: feature-login
Submission: sub_789
Decision: NEEDS WORK ✗
Reviewed by: Sarah Chen
Review comments: 4 inline comments

Feedback:
"Good start, but needs a few improvements before merging:
1. Add error handling for OAuth failures (see line 45)
2. Add validation for edge cases
3. Missing unit tests for error paths

Once you fix these, feel free to re-submit."

Developer notification:
✓ Feedback sent to Ajay Patel

Developer can re-submit after making changes:
1. Fix the issues mentioned in the review
2. Commit: vie commit "Address review feedback"
3. Push: vie push

The code will go back into the review queue with the same reviewer
or another senior developer.
```

---

## Manager Approval Messages

### Approval Granted

```
Manager Approval Granted ✓

Submission: sub_789
Branch: feature-login
Approved by: Manager Name
Approved at: Jan 30, 2025 4:55 PM

Senior review: Sarah Chen ✓
Manager review: Manager Name ✓

Status: APPROVED

Deployment will be triggered automatically to STAGING environment.
Expected duration: 15 minutes

Monitor deployment: vie deployment logs dep_456 --follow
```

### Approval Rejected

```
Manager Approval Rejected ✗

Submission: sub_789
Branch: feature-login
Rejected by: Manager Name
Rejected at: Jan 30, 2025 4:55 PM

Reason: "Production not ready for this feature yet. Please hold off on deployment."

Developer notification:
✓ Feedback sent to Ajay Patel

This code is approved by Senior Developer but blocked by Manager.
You can ask your Manager for clarification on when to proceed.

Status: MANAGER_REJECTED
```

---

## Tone Guidelines

### ✅ Examples of Good Messages

```
"Branch protection prevents direct pushes to main. Use a feature
branch instead: vie branch feature-your-work"

"Tests failed at: UserController.js line 156. See logs above for
the exact error. Fix the code and push again."

"Code review approved. Waiting for Manager final approval, usually
completes within 2 hours during business hours."
```

### ❌ Examples to Avoid

```
"Oops! Something went wrong" (vague)
"You can't do that!" (condescending)
"🎉 Great job, keep it up!" (too casual)
"Your code is totes broken, dude" (unprofessional)
```

---

## UI Component Messages

### Toast Notifications (3 seconds)

```
✓ Code submitted successfully
→ Tests running, refresh dashboard for updates

✗ Validation failed
→ Check error details below

! 2 reviews pending
→ View your submissions to see feedback
```

### Loading States

```
→ Validating your code...
→ Running automated tests...
→ Waiting for Senior Developer review...
→ Deploying to staging...
```

### Empty States

```
No pending reviews

You have no code reviews assigned to you right now.
When teammates submit code, they'll appear here.

Help → Learn about code review best practices
```

---

## Consistency Rules

1. **Use consistent status indicators:**
   - ✓ for success
   - ✗ for failure
   - → for in-progress
   - ⚠ for warnings

2. **Always provide next steps** in error messages

3. **Show context** (who, what, when) in all messages

4. **Use exact identifiers** (submission ID, commit hash) for traceability

5. **Professional tone** throughout - this is a work system

6. **Avoid assumptions** about user knowledge - be explicit

7. **Action-oriented** - tell users what to do next
