# VIE (Virtual Industry Experience)

**VIE** is a role-based simulation of a real software company. It lets users experience how code moves from **submission → CI → review → approval**, with realistic permissions and workflow gating.

This is **NOT** a GitHub clone. This is **NOT** a learning dashboard.  
This **IS** a virtual company’s internal engineering system.

---

## What is VIE?

VIE is a portfolio-grade platform that mirrors how professional teams collaborate on code: juniors submit, seniors review, managers approve, and CI enforces quality.

---

## Why this project exists (problem it solves)

Most portfolio projects only demonstrate CRUD or UI polish. They don’t show **how real teams ship software** or how **role-based responsibility** works. VIE solves that by modeling a realistic workflow and enforcing it both in the UI and the backend.

---

## How it simulates real industry workflow

- **JWT auth + RBAC** ensures each role can only perform relevant actions.
- **Submissions + Reviews** model the actual PR review chain.
- **GitHub Actions** simulates CI enforcement with build/test gates.
- **Dashboards** expose only role-relevant tasks to users.

---

## Roles involved

| Role | What they can do |
|------|------------------|
| **Junior Developer** | Submit code, view status |
| **Senior Developer** | Review and approve/request changes |
| **Manager** | Final approval or rejection |

---

## End-to-end lifecycle (Submit → Review → CI → Approval)

1. **Junior submits code** (submission created)
2. **CI runs** (backend tests + frontend build)
3. **Senior reviews** (approve or request changes)
4. **Manager final approval** (approve or reject)
5. **Submission status updates** reflect each stage

---

## Architecture Overview

See the full diagram and breakdown in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## How I would explain this project in an interview

**Key talking points**
- “I built a realistic engineering workflow: Junior submits, Senior reviews, Manager approves.”
- “The backend enforces RBAC and workflow state transitions.”
- “The frontend shows only role-appropriate actions, but real security is on the backend.”
- “CI runs on every PR and push to main, simulating real release gates.”

**Design decisions**
- Service/controller separation for maintainability
- Explicit workflow statuses for auditability
- Role-gated routes and UI actions for clarity

**Tradeoffs**
- Simple UI to focus on correctness and workflow
- CI simulation is documented rather than deeply integrated into backend state

**If I had more time**
- Live CI status updates in the dashboard
- Deployment simulation and audit logging
- WebSocket terminal for command execution

---

## AI Usage Transparency

AI was used as an assistant to speed up boilerplate and documentation drafting. All core architecture, workflow rules, and implementation decisions were owned and validated by the developer.

---

## Success Criteria

- A recruiter understands the project in under 2 minutes.
- An interviewer can deep-dive for 20+ minutes on architecture, RBAC, and workflow design.

---

## 📚 Documentation

- [MVP Breakdown](MVP_BREAKDOWN.md) - Feature roadmap and timeline
- [Architecture](ARCHITECTURE.md) - System design and data flow
- [Database Schema](DATABASE_SCHEMA.md) - MongoDB collections
- [Commands](COMMANDS.md) - VIE command reference
- [API Specification](API_SPEC.md) - REST endpoints
- [Rule Engine](RULE_ENGINE.md) - Validation and enforcement
- [CI/CD Flow](CICD_FLOW.md) - Pipeline simulation design
- [System Messages](SYSTEM_MESSAGES.md) - Professional UX guidelines
- [Project Structure](PROJECT_STRUCTURE.md) - Backend code organization
- [Phase 5 API Flow Testing](PHASE_5_API_FLOW_TESTING.md) - End-to-end API verification
- [Phase 7 CI/CD Simulation](PHASE_7_CICD.md) - CI pipeline + review enforcement

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 License

TBD

---

Built with the goal of providing authentic industry experience to aspiring developers.
