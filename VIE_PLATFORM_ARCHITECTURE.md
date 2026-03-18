# VIE Platform Architecture
## Virtual Industry Experience - Industry Simulation Learning Engine

**Version**: 2.0 (Upgrade from MVP)  
**Target**: Industry-grade learning simulation without over-engineering  
**Last Updated**: February 21, 2026

---

## 🎯 Platform Philosophy

VIE is NOT a task manager or GitHub clone.

**VIE is:** A structured environment where learners experience real software industry workflows while building measurable skills.

Every feature must answer: *"What does the user learn from this?"*

---

## 📋 ROLE ARCHITECTURE

### Role Hierarchy & Learning Outcomes

```
ADMIN (Strategic Leader)
└─ Creates Organization
   └─ MANAGER (Project Leader)
      ├─ Breaks Projects → Tasks
      ├─ Assigns to JUNIOR
      └─ SENIOR Reviews Quality
         └─ JUNIOR (Individual Contributor)
            └─ Executes Tasks → Submits → Receives Feedback → Resubmits
```

---

## 👥 ROLE DETAILED BREAKDOWN

### 1️⃣ ADMIN – Industry Architect

**What They Do:**
- Create organization workspace
- Create multiple team workspaces
- Assign managers to workspaces
- View organization-wide metrics
- Monitor team skill distribution

**What They Learn:**
- Organizational structuring
- Strategic thinking
- Performance analysis
- Team composition optimization

**Admin Dashboard Components:**
```
┌─────────────────────────────────────────┐
│ VIE Organization Dashboard              │
├─────────────────────────────────────────┤
│ [Workspace 1] [Workspace 2] [Workspace 3]
│
│ Team Performance Index
│ ├─ Total Members: X
│ ├─ Avg Skill Level: Y
│ ├─ Project Completion Rate: Z%
│ └─ Top Skills Developed: [List]
│
│ Skill Heatmap (Grid visualization)
│ ├─ Frontend: 4.2/5
│ ├─ Backend: 3.8/5
│ ├─ API Dev: 4.0/5
│ └─ [Other skills]...
│
│ Recent Activity Feed
│ ├─ John submitted task
│ ├─ Sarah approved submission
│ └─ [More events]...
└─────────────────────────────────────────┘
```

---

### 2️⃣ MANAGER – Delivery & Performance Leader

**What They Do:**
- Own project delivery
- Break projects into concrete tasks
- Define deadlines & priority levels
- Assign tasks to junior developers
- Review performance metrics
- Make final approval decisions

**What They Learn:**
- Task decomposition skills
- Deadline management
- Team performance evaluation
- Project success ownership
- Resource allocation thinking

**Manager Dashboard Components:**
```
┌─────────────────────────────────────────┐
│ Project Management Dashboard            │
├─────────────────────────────────────────┤
│ Active Projects (3/5)
│ ┌─────────────────────────────────────┐
│ │ Project: User Auth Module           │
│ │ Progress: ████████░░ 82%            │
│ │ Due: 2026-02-28                     │
│ │ Deadline Status: ON TRACK           │
│ │ Assigned: 3 Juniors                 │
│ └─────────────────────────────────────┘
│
│ Task Status Board
│ ├─ To Do: 5 tasks
│ ├─ In Progress: 4 tasks
│ ├─ Review Pending: 3 tasks
│ ├─ Approved: 12 tasks
│ └─ Rejected: 1 task
│
│ Team Efficiency Metrics
│ ├─ Avg Submission Time: 2.3 days
│ ├─ First Review Approval Rate: 78%
│ ├─ Rework Average: 1.2x per task
│ └─ Team Velocity: 4.5 tasks/week
│
│ Delivery Analytics
│ └─ [Line chart: completion rate over time]
└─────────────────────────────────────────┘
```

---

### 3️⃣ SENIOR – Technical Mentor

**What They Do:**
- Review junior submissions
- Add inline code comments
- Suggest improvements
- Recommend approve/reject
- Provide structured feedback
- Guide technical decisions

**What They Learn:**
- Code review best practices
- Mentorship & leadership
- Technical evaluation skills
- Quality assurance mindset
- Constructive feedback delivery

**Senior Dashboard Components:**
```
┌─────────────────────────────────────────┐
│ Review & Mentorship Dashboard           │
├─────────────────────────────────────────┤
│ Review Queue
│ ┌─────────────────────────────────────┐
│ │ 🔴 URGENT: John's Auth Module      │
│ │    Submitted: 2 hours ago           │
│ │    Resubmission: Yes (1st rework)   │
│ │    [View Code] [Add Review]         │
│ └─────────────────────────────────────┘
│
│ Mentorship Stats
│ ├─ Juniors Mentored: 4
│ ├─ Reviews Given: 47
│ ├─ Avg Review Time: 1.2 hours
│ ├─ Feedback Score: 4.3/5
│ └─ Junior Improvement: +23% since start
│
│ Review Effectiveness
│ ├─ First Pass Approval: 67%
│ ├─ Avg Feedback Points: 4.2
│ └─ Junior Skill Growth (mentees): ↑18%
│
│ Recent Reviews
│ └─ [List of recent reviews with outcomes]
└─────────────────────────────────────────┘
```

---

### 4️⃣ JUNIOR – Skill Builder

**What They Do:**
- Receive assigned tasks
- Work in in-browser coding environment
- Submit completed work
- Receive feedback from seniors
- Apply feedback & resubmit if rejected
- Track skill growth

**What They Learn:**
- Real-world development workflow
- Handling code review feedback
- Iterative improvement mindset
- Deadline discipline
- Professional accountability
- Skill-building through practice

**Junior Dashboard Components:**
```
┌─────────────────────────────────────────┐
│ Learning & Execution Dashboard          │
├─────────────────────────────────────────┤
│ Assigned Tasks (Active: 3)
│ ┌─────────────────────────────────────┐
│ │ ✓ Build Login Form (Frontend)       │
│ │   Due: Tomorrow | Priority: HIGH    │
│ │   Status: IN PROGRESS               │
│ │   [Open Editor] [Submit]            │
│ └─────────────────────────────────────┘
│
│ Skill Progress (Real-time)
│ ├─ Frontend: ■■■■□ 4.0 (+0.2 XP)
│ ├─ Backend: ■■■□□ 3.0
│ ├─ API Dev: ■■■□□ 3.0 (+0.1 XP)
│ ├─ Testing: ■■□□□ 2.0
│ ├─ DevOps: ■□□□□ 1.5
│ ├─ Docs: ■■□□□ 2.2
│ └─ Comm: ■■■□□ 3.5
│
│ Submission History
│ ├─ ✅ Login Form (Approved - 1st try)
│ ├─ ⚠️ API Endpoint (Rejected - 2 reworks)
│ ├─ 📝 Password Reset (Pending Review)
│ └─ ⏳ Database Schema (Not Started)
│
│ Recent Feedback
│ │ @Sarah: "Great use of async/await. 
│ │          Next time add error handling."
│ └─ [Feedback timeline]
│
│ Performance Metrics
│ ├─ Tasks Completed: 8/12
│ ├─ Approval Rate: 75%
│ ├─ Avg Rework Count: 1.3x
│ └─ Skill Growth This Month: +12%
└─────────────────────────────────────────┘
```

---

## 🎓 SKILL TRACKING SYSTEM

### Skill Categories

```javascript
SKILLS = [
  'Frontend Development',
  'Backend Development',
  'API Development',
  'Testing & QA',
  'DevOps',
  'Documentation',
  'Communication'
]
```

### Skill Model

```javascript
{
  _id: ObjectId,
  skillName: string,        // "Frontend Development"
  level: number,            // 0-5 (0=Unknown, 5=Expert)
  xp: number,               // Experience points
  nextLevelXp: number,      // XP needed for next level
  
  // Performance metrics
  taskCount: number,        // Tasks completed in this skill
  approvalRate: number,     // % of first-time approvals (0-100)
  avgReworkCount: number,   // Avg rework cycles
  completionEfficiency: number, // Time spent vs deadline
  
  // Growth tracking
  lastUpdated: timestamp,
  growthTrend: [           // Last 30 days
    { date, xp, level }
  ]
}
```

### XP & Leveling System

**Simplified (Not over-engineered):**

```
Level 0 → 1: 100 XP
Level 1 → 2: 150 XP
Level 2 → 3: 200 XP
Level 3 → 4: 300 XP
Level 4 → 5: 500 XP

When task approved:
- Base XP: 10–50 (by task difficulty)
- Bonus: +50% if first-time approval
- Bonus: +25% if submitted before deadline
- Bonus: +15% for quality (feedback quality score)

Example:
- Task XP: 30
- First-time approval: +50% = 45
- Early submission: +25% = 56.25
- Quality bonus: +15% = 64.7875 ≈ 65 XP total
```

### Display Format

```
┌──────────────────────────┐
│ Frontend Development     │
├──────────────────────────┤
│ Level: 3 / 5             │
│ XP: 245 / 300            │
│ Progress: ███░░░░░░░░░░ │
│                          │
│ Stats (This Month)       │
│ ├─ Tasks Done: 4         │
│ ├─ Approval Rate: 75%    │
│ ├─ Avg Reworks: 1.2x     │
│ └─ Trend: ↗ +8 XP       │
└──────────────────────────┘
```

---

## 💻 CODING ENVIRONMENT

### Requirements

```
✓ Monaco Editor (VS Code style)
✓ File explorer sidebar
✓ Code preview/output panel
✓ Simulated terminal
✓ Submit button
✓ Real-time save to database
✓ Diff viewer (for seniors reviewing)
✓ Syntax highlighting for multiple languages
✓ NO real code execution (no Docker, no actual server)
```

### Component Structure

```jsx
CodingEnvironment.jsx
├─ FileExplorer.jsx
│  └─ Shows task project structure
├─ MonacoEditor.jsx
│  └─ Main code editor
├─ PreviewPanel.jsx
│  └─ Output/result display (mocked)
├─ SimulatedTerminal.jsx
│  └─ Terminal UI with fake commands
└─ SubmitButton.jsx
   └─ Save & submit work
```

### Code Storage

```javascript
// In database: CodeSubmission model
{
  _id: ObjectId,
  taskId: ObjectId,
  juniorId: ObjectId,
  files: {
    'src/App.jsx': 'const App = () => {...}',
    'src/components/Button.jsx': 'export const Button = ...',
    'package.json': '{...}'
  },
  submittedAt: timestamp,
  status: 'pending_review' | 'approved' | 'rejected',
  version: 1,
  previousVersions: [...]
}
```

### Diff Viewer (Senior Reviews)

```
┌─────────────────────────────────────────┐
│ Code Review: Login Form Submission      │
├─────────────────────────────────────────┤
│ Version 1 (Current)              [v1] [v2] [v3]
│
│ src/components/LoginForm.jsx
│
│ ─ old  │ + new  │ Code
├────────┼────────┼──────────────────────
│        │  + 1   │ import React from 'react'
│  2     │  3     │ const LoginForm = () => {
│        │  + 4   │   const [email, setEmail] = useState('')
│  3     │  5     │   return (
│        │  - 4   │   // TODO: validation (REMOVED)
│  4     │  + 6   │   <form onSubmit={handleSubmit}>
│  5     │  7     │     <input value={email} />
│        │  + 8   │     <button type="submit">Login</button>
```

---

## 🖥️ SIMULATED TERMINAL

### Purpose
Learn real developer workflow without actual system execution.

### Fake Commands

```bash
# Supported commands with realistic output

$ npm install
> npm notice created a lockfile as package-lock.json
> added 156 packages in 2.3s

$ npm start
> React App started on http://localhost:3000

$ git commit -m "Add login validation"
> [main abc1234] Add login validation
> 1 file changed, 12 insertions(+), 3 deletions(-)

$ git push
> Enumerating objects: 5, done.
> Counting objects: 100% (5/5), done.
> Delta compression using up to 12 threads
> Writing objects: 100% (3/3), 245 bytes | 245.00 KiB/s
> To github.com:user/repo.git
>    9fde3c9..a1b2c3d  main -> main

$ npm run build
> react-scripts build
> Creating an optimized production build...
> The build folder is ready to be deployed.
> Build size: 234KB

$ clear
[Clears terminal]

$ help
Available commands:
  npm install    - Simulate package installation
  npm start      - Start development server
  npm run build  - Build for production
  git commit     - Commit changes
  git push       - Push to repository
  clear          - Clear terminal
  help           - Show this message
```

### UI Implementation

```jsx
SimulatedTerminal.jsx
├─ Terminal output area (read-only, scrollable)
├─ Command input field
├─ Auto-complete suggestions
└─ Command history (↑↓ arrow keys)
```

---

## 🏗️ DATABASE SCHEMA UPDATES

### New Models Required

```
Skill
├─ skillName
├─ userId (learner)
├─ level
├─ xp
└─ growthHistory[]

CodeSubmission
├─ taskId
├─ juniorId
├─ files{}
├─ submittedAt
├─ status
├─ version
└─ previousVersions[]

Review
├─ submissionId
├─ seniorId
├─ inlineComments[]
├─ recommendation (approve/reject)
├─ feedback
└─ submittedAt

Task
├─ projectId
├─ title
├─ description
├─ skillCategory[] (required skills)
├─ difficulty (1-5)
├─ deadline
├─ assignedTo (junior)
├─ status
└─ submissions[]

Project
├─ workspaceId
├─ title
├─ tasks[]
├─ managerId
├─ startDate
├─ deadline
└─ status
```

---

## 🗂️ FOLDER STRUCTURE

```
frontend/src/
├─ components/
│  ├─ CodeEditor/
│  │  ├─ MonacoEditor.jsx
│  │  ├─ FileExplorer.jsx
│  │  ├─ PreviewPanel.jsx
│  │  ├─ SimulatedTerminal.jsx
│  │  └─ CodeEditor.css
│  ├─ Dashboard/
│  │  ├─ AdminDashboard.jsx
│  │  ├─ ManagerDashboard.jsx
│  │  ├─ SeniorDashboard.jsx
│  │  ├─ JuniorDashboard.jsx
│  │  └─ DashboardShared.css
│  ├─ SkillTracker/
│  │  ├─ SkillCard.jsx
│  │  ├─ SkillProgress.jsx
│  │  ├─ SkillHeatmap.jsx
│  │  └─ SkillTracker.css
│  └─ Reviews/
│     ├─ ReviewQueue.jsx
│     ├─ CodeDiffViewer.jsx
│     ├─ InlineComments.jsx
│     └─ ReviewUI.css
├─ pages/
│  ├─ LandingPage.jsx
│  ├─ AdminDashboardPage.jsx
│  ├─ ManagerDashboardPage.jsx
│  ├─ SeniorDashboardPage.jsx
│  ├─ JuniorDashboardPage.jsx
│  └─ CodeEditorPage.jsx
└─ styles/
   └─ [shared styles]

backend/src/
├─ models/
│  ├─ Skill.js
│  ├─ CodeSubmission.js
│  ├─ Review.js
│  ├─ Task.js
│  ├─ Project.js
│  └─ [existing models]
├─ controllers/
│  ├─ skill.controller.js
│  ├─ submission.controller.js
│  ├─ review.controller.js
│  ├─ dashboard.controller.js
│  └─ [existing controllers]
├─ routes/
│  ├─ skills.routes.js
│  ├─ submissions.routes.js
│  ├─ reviews.routes.js
│  ├─ dashboard.routes.js
│  └─ [existing routes]
└─ services/
   ├─ skill.service.js
   ├─ submission.service.js
   ├─ review.service.js
   └─ [existing services]
```

---

## 🎯 LEARNING OUTCOMES MAPPING

### ADMIN Learning Path
- Org structure → Workspace creation
- Team allocation → Manager assignment
- Analytics → Performance monitoring
- **Outcome**: Can design and manage a tech organization

### MANAGER Learning Path
- Project planning → Task breakdown
- Timeline management → Deadline setting
- Performance eval → Team assessment
- **Outcome**: Can deliver projects with teams

### SENIOR Learning Path
- Code review → Inline comments
- Mentorship → Feedback delivery
- Evaluation → Approve/reject decision
- **Outcome**: Can guide junior developers effectively

### JUNIOR Learning Path
- Task execution → Code submission
- Review cycles → Feedback processing
- Skill building → XP → Levels
- **Outcome**: Can work in real industry workflows

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
- [ ] Create Skill model
- [ ] Add CodeSubmission model
- [ ] Build Junior Dashboard skeleton
- [ ] Add Monaco Editor component

### Phase 2: Coding Environment (Week 2)
- [ ] Complete Monaco integration
- [ ] Add file explorer
- [ ] Add simulated terminal
- [ ] Add code save/submit flow

### Phase 3: Review System (Week 3)
- [ ] Create Review model
- [ ] Build code diff viewer
- [ ] Add inline comments
- [ ] Senior review queue

### Phase 4: Skill Tracking (Week 4)
- [ ] Implement skill XP system
- [ ] Add skill visualization
- [ ] Create admin heatmap
- [ ] Track growth trends

### Phase 5: Manager Features (Week 5)
- [ ] Task creation & management
- [ ] Project dashboard
- [ ] Performance metrics
- [ ] Team analytics

### Phase 6: Polish & Deploy (Week 6)
- [ ] Performance optimization
- [ ] UI/UX refinement
- [ ] Testing & QA
- [ ] Production deployment

---

## ✅ KEY PRINCIPLES

```
✓ Learning-first design
✓ Role isolation maintained
✓ No Docker/containers
✓ Lightweight & deployable
✓ Scalable structure
✓ Simple XP system (not over-engineered)
✓ Realistic terminal simulation
✓ Real database persistence
✓ Clear skill progression
✓ Industry-grade UI
```

---

**This is the blueprint. Phase 1 begins now.**
