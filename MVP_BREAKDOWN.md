# VIE MVP BREAKDOWN

## Phase 1: Core Platform (MVP)

### 1.1 Authentication & Onboarding
- User registration with role assignment (Junior Dev / Senior Dev / Manager)
- Login system with JWT tokens
- User profile with role and department
- Company namespace (single company initially, e.g. "Acme Corp")

### 1.2 Project Setup
- Create/initialize project (creates internal git repository)
- Project dashboard showing:
  - Current branch
  - Pending reviews
  - Deployment status
  - Team members

### 1.3 Web Terminal Interface
- Built-in command terminal (xterm-style web UI)
- Command execution happens server-side
- Custom VIE command set (not raw git)
- Real-time output streaming
- Command history

### 1.4 Code Workflow (Junior Developer)
- `vie branch <name>` - Create feature branch
- `vie status` - Show current branch and uncommitted changes
- `vie commit "message"` - Stage and commit code
- `vie push` - Submit code for review
  - Fails if: branch is main
  - Fails if: validation rules broken
  - Succeeds: creates review request, triggers CI

### 1.5 Automated Testing (CI Pipeline)
- Simulated test run (can execute real tests)
- Shows: build stage, test stage, results
- Tests fail → submission rejected, junior must resubmit
- Tests pass → moved to senior review

### 1.6 Code Review Workflow (Senior Developer)
- Review dashboard showing pending submissions
- View code diff and changes
- Can approve or reject with comments
- Approval moves to Manager
- Rejection goes back to Junior with message

### 1.7 Manager Approval & Deployment
- Final approval dashboard
- Can approve or reject
- Approval triggers deployment simulation
- View deployment progress and logs
- Deployment success/failure messages

### 1.8 Deployment Experience
- Simulated deployment pipeline
- Status updates: initializing → deploying → success/failure
- Environment info (staging/production)
- Logs and output
- Junior can view but not control

### 1.9 Role-Based Access Control
- Junior: read code, write code, push (not main), view reviews/deployments
- Senior: review submissions, approve/reject, view deployments
- Manager: final approval, trigger/view deployments

---

## Phase 2: Enhanced Features (Post-MVP)

### 2.1 Advanced Code Management
- Branch protection rules configuration
- Commit history and blame view
- File-specific diffs
- Inline comments during review

### 2.2 CI/CD Enhancements
- Real test execution (jest, mocha, etc.)
- Code coverage reports
- Artifact storage
- Rollback capability

### 2.3 Multiple Projects
- Switch between projects
- Cross-project deployment orchestration
- Multi-team support

### 2.4 Analytics & Monitoring
- Deployment analytics
- Review turnaround metrics
- Code quality metrics
- Team productivity dashboards

### 2.5 Integration & Webhooks
- Slack notifications
- Email alerts
- Custom webhooks
- External service integration

---

## Implementation Priority

**Week 1:** Auth + Web Terminal + Basic Workflow
**Week 2:** CI Pipeline Simulation + Code Review
**Week 3:** Manager Approval + Deployment Simulation
**Week 4:** Polish + Testing

---

## Success Criteria for MVP

1. ✓ Junior Dev can push code and see it in review (without raw git exposure)
2. ✓ Senior Dev can review and approve/reject with company-style UX
3. ✓ Manager can deploy with full visibility
4. ✓ All git operations invisible to users
5. ✓ Realistic system messages and workflows
6. ✓ Complete rejection → fix → resubmit loop works smoothly
7. ✓ CI/CD feels real (even if simulated)
