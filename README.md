# VIE (Virtual Industry Experience)

**VIE** is a closed, internal, company-like development platform designed to give users a **REAL software industry experience**.

This is **NOT** a GitHub clone. This is **NOT** a learning dashboard.  
This **IS** a virtual company's internal engineering system.

---

## 🎯 Vision

Users should genuinely feel: *"I am working inside a real company's internal development system."*

All activities happen **INSIDE VIE**:
- Code push
- Automated testing
- Senior review
- Approval
- Deployment experience

**No external GitHub UI. No external CI/CD exposure.**  
Git and pipelines are **INVISIBLE** to users.

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Junior Developer** | Write code, push to feature branches, view reviews & deployments |
| **Senior Developer** | Review code, approve/reject submissions |
| **Manager** | Final approval, trigger deployments |

---

## 🎮 Core Experience

### Junior Developer Workflow
1. Create feature branch
2. Write code and commit
3. Push code (triggers CI pipeline)
4. **If tests fail** → Fix and re-push
5. **If tests pass** → Code goes to Senior Developer review
6. **If rejected** → Fix issues and re-push
7. **If approved** → Sent to Manager for final approval
8. **Manager approves** → Deployment triggered
9. Junior can **view** deployment progress (but cannot control)

This **reject → fix → resubmit → approve** loop is the core learning experience.

---

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Git Operations**: Server-side (nodegit)
- **Terminal**: Web-based (xterm.js + WebSocket)
- **Auth**: JWT with role-based access control

---

## 📚 Documentation

- [MVP Breakdown](MVP_BREAKDOWN.md) - Feature roadmap and timeline
- [Architecture](ARCHITECTURE.md) - System design and data flow
- [Database Schema](DATABASE_SCHEMA.md) - MongoDB collections
- [Commands](COMMANDS.md) - VIE command reference
- [API Specification](API_SPEC.md) - REST & WebSocket endpoints
- [Rule Engine](RULE_ENGINE.md) - Validation and enforcement
- [CI/CD Flow](CICD_FLOW.md) - Pipeline simulation design
- [System Messages](SYSTEM_MESSAGES.md) - Professional UX guidelines
- [Project Structure](PROJECT_STRUCTURE.md) - Backend code organization

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Git 2.30+

### Installation (Coming Soon)
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
cd VIE/backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB
docker-compose up -d mongodb

# Run the server
npm run dev
```

---

## 🎯 Project Status

**Current Phase**: Architecture & Design ✅  
**Next Phase**: Backend Implementation

---

## 📝 License

TBD

---

## 🤝 Contributing

This is currently a private project. Contribution guidelines will be added later.

---

Built with the goal of providing authentic industry experience to aspiring developers.
