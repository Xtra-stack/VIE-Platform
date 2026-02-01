# Phase 7: CI/CD Simulation + Review Enforcement (VIE)

This phase introduces a lightweight CI pipeline and documented review gates to simulate how real engineering teams enforce code quality and approvals.

---

## 1) GitHub Actions CI Pipeline

**Workflow file**: [.github/workflows/ci.yml](.github/workflows/ci.yml)

**Triggers**:
- `push` to `main`
- `pull_request` targeting `main`

**Steps**:
1. Install backend dependencies
2. Run backend tests
3. Install frontend dependencies
4. Build frontend

**Result**: CI fails if any step fails, blocking merge.

---

## 2) Review Gate Simulation (Documentation)

### Required Review Rules (Conceptual)
- **Junior** cannot merge PRs
- **Senior** approval is required
- **Manager** approval is required for final merge

### Branch Protection (GitHub Settings)
Enable on `main`:
- Require pull request reviews before merging
- Require **2 approvals** (Senior + Manager)
- Dismiss stale approvals when new commits are pushed
- Require status checks to pass before merging
  - `VIE CI` (from GitHub Actions)
- Restrict who can push to `main` (Managers only)

> These rules are set in repository settings; the codebase documents the intended enforcement.

---

## 3) Status Mapping (Workflow Concept)

| CI / Review State | Submission Status (Concept) |
|---|---|
| CI failed | CHANGES_REQUESTED |
| CI passed + Senior approved | SENIOR_APPROVED |
| Manager approved | FINAL_APPROVED |

> Backend remains the source of truth. CI only simulates company pressure and compliance gates.

---

## 4) Why CI Blocks Promotion

- CI catches regressions early (tests + build failures)
- Failed checks prevent merging, matching real release policies
- This enforces discipline: developers fix errors before code can proceed

---

## 5) Real-World Mapping (Jira/GitHub)

- **Jira**: Ticket moves from "In Review" → "Ready for QA" after CI success and approvals
- **GitHub**: PR status checks + required approvals enforce quality gates
- **VIE**: Mirrors these controls with lightweight pipeline + documented branch protections

---

## 6) Interview Section

### How this project simulates real production workflow
- CI validates backend tests and frontend builds on every PR
- Required approvals simulate real company review gates
- Merges are blocked until CI + Senior + Manager approvals are complete

### How juniors experience review + CI failures
- Juniors see failures quickly via CI checks
- Seniors request changes when CI fails or code needs improvement
- Managers approve only after Senior approval + green CI

---

## 7) What This Adds Over CRUD Projects

- Realistic pipeline enforcement (tests + builds)
- Approval gates (Senior + Manager) reflect enterprise workflows
- CI outcomes mapped to workflow decisions
- Demonstrates real-world engineering discipline beyond basic API CRUD
