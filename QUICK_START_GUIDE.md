# VIE Platform - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running on localhost:27017
- Ports available: 3000 (backend), 5173 (frontend)

---
     
## 📦 Installation

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```

**Expected Output:**
```
✓ Connected to MongoDB successfully
✓ VIE Backend is running on port 3000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Expected Output:**
```
  VITE v5.4.21  ready in 1616 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 👥 Test Accounts

Create test accounts through the platform's "Create Workspace" flow or manually:

### Manager Account:
```
Username: manager1
Password: manager123
Role: MANAGER
```

### Senior Developer:
```
Username: senior1
Password: senior123
Role: SENIOR
```

### Junior Developer:
```
Username: junior1
Password: junior123
Role: JUNIOR
```

---

## 🎯 Workflow Walkthrough

### Step 1: Manager Creates Workspace

1. Login as **Manager** at `http://localhost:5173/login`
2. Navigate to Manager Dashboard
3. Find "🚀 Project Workspaces" section
4. Click **"+ Create Workspace"**
5. Fill form:
   - **Workspace Name**: "User Authentication"
   - **Project**: Select from dropdown
   - **Project Type**: "New Feature"
   - **Tech Area**: "Full Stack"
6. Click **"Create Workspace"**

✅ **Result:** Workspace created, tasks auto-generated for assigned juniors

---

### Step 2: Manager Invites Team

1. Scroll to "👥 Invite Team Members"
2. Fill form:
   - Full Name, Username, Email, Password
   - Role: Senior or Junior
3. Click **"Invite User"**

✅ **Result:** New user account created and added to project

---

### Step 3: Junior Receives Task

1. Login as **Junior** at `http://localhost:5173/login`
2. View "📋 Assigned Tasks" section (top of dashboard)
3. See task with status **ASSIGNED** (blue badge)
4. Click **"Start Work"**

✅ **Result:** Task status changes to **IN_PROGRESS** (orange badge)

---

### Step 4: Junior Submits Code

1. Scroll to "📤 Submit Code" section
2. Fill form:
   - **Project**: Select project
   - **Source Branch**: `feature/user-auth`
   - **Target Branch**: `develop`
   - **Title**: "Implement user authentication"
   - **Description**: "Added login and signup endpoints"
   - **Code Snippet**: Paste your code
   - **Files Changed**: One file per line
3. Click **"Submit for Review"**

✅ **Result:** 
- Code submitted
- Build simulation starts (2-5 seconds)
- Test results displayed
- Task status: **SUBMITTED** (purple badge)

---

### Step 5: Build Results Display

Junior sees:
```
🟢 Build SUCCESS
🧪 47/47 tests passed · 87.5% coverage
⏱️ 3s
```

If coverage < 75%:
```
🔴 Build SUCCESS (with warning)
🧪 42/47 tests passed · 73.2% coverage (⚠️ Min: 75%)
```

---

### Step 6: Senior Reviews Code

1. Login as **Senior** at `http://localhost:5173/login`
2. View "👁️ Code Reviews" section
3. See pending submission
4. Click **"📋 Review Code"**
5. Review modal opens with:
   - Code diff viewer
   - File list
   - Comment section
6. Add comments (optional):
   - Overall comment
   - File-level comments
   - Line-specific comments
7. Choose action:
   - **✓ Approve** (escalates to Manager)
   - **Request Changes** (back to Junior with feedback)

✅ **Result:** 
- If approved: Manager sees final approval request
- If changes requested: Junior sees rejection feedback

---

### Step 7: Junior Resubmits (if needed)

If Senior requested changes:

1. Junior sees rejection card with:
   - Rejection reason
   - File name (if specified)
   - Line number (if specified)
2. Click **"🔄 Resubmit Changes"**
3. Update code in modal
4. Click **"Resubmit for Review"**

✅ **Result:** New submission created, linked to previous one

---

### Step 8: Manager Final Approval

1. Login as **Manager** at `http://localhost:5173/login`
2. View "✅ Final Approval" section
3. See submissions approved by Seniors
4. Click **"Review"**
5. Review code and senior's comments
6. Add final comment (optional)
7. Choose:
   - **✓ Approve** (merge + deploy)
   - **✗ Reject** (back to Junior)

✅ **Result:**
- If approved: Code merged, task status: **APPROVED** (green)
- If rejected: Junior receives feedback

---

## 🎨 UI Features

### Task Status Colors:
- 🔵 **ASSIGNED** - Blue
- 🟠 **IN_PROGRESS** - Orange
- 🟣 **SUBMITTED** - Purple
- 🔴 **CHANGES_REQUESTED** - Red
- 🟢 **APPROVED** - Green

### Build Status:
- ✅ **SUCCESS** - Green badge
- ❌ **FAILED** - Red badge
- ⏳ **RUNNING** - Yellow with animation

### Modal Controls:
- **ESC key** - Closes any modal
- **Click outside** - Closes modal
- **✕ button** - Top-right close button
- **Cancel button** - Bottom cancel action
- **Close button** - Bottom close action

---

## 🔍 Debugging Tips

### Backend Not Starting?
```bash
# Check if MongoDB is running
mongod --version

# Check if port 3000 is free
netstat -ano | findstr :3000

# Kill process on port 3000 (Windows)
taskkill /PID <PID> /F
```

### Frontend Not Loading?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 5173 is free
netstat -ano | findstr :5173
```

### Database Issues?
```bash
# Connect to MongoDB and check
mongosh
use vie_development
db.users.find()
db.projects.find()
```

### API Errors?
- Check browser console (F12)
- Check Network tab for failed requests
- Verify JWT token in localStorage
- Check backend terminal for error logs

---

## 📊 Sample Data

### Create Sample Project (MongoDB):
```javascript
use vie_development

db.companies.insertOne({
  name: "Test Company",
  slug: "test-company",
  timezone: "UTC",
  country: "US",
  createdAt: new Date()
})

db.projects.insertOne({
  name: "Test Project",
  slug: "test-project",
  companyId: ObjectId("your-company-id"),
  mainBranch: "main",
  createdAt: new Date()
})
```

---

## 🧪 Testing Checklist

### Manager:
- [ ] Can create workspace
- [ ] Can invite users
- [ ] Can see workspace list
- [ ] Can view final approvals
- [ ] Can approve/reject submissions
- [ ] Can upload base code (optional)

### Junior:
- [ ] Can see assigned tasks
- [ ] Can start work (status change)
- [ ] Can submit code
- [ ] Sees build results
- [ ] Sees coverage warning if < 75%
- [ ] Can view rejection feedback
- [ ] Can resubmit code

### Senior:
- [ ] Can see pending reviews
- [ ] Can open review modal
- [ ] Can add comments
- [ ] Can approve (escalates to Manager)
- [ ] Can request changes
- [ ] CANNOT merge or deploy

---

## 🚨 Known Limitations

1. **No Real Git**: All repository operations simulated
2. **No Real CI/CD**: Build results are mock data
3. **No File Upload UI**: Base code upload needs frontend form
4. **No WebSocket**: Real-time updates require page refresh
5. **No Email**: User invites don't send email notifications
6. **Simple Build**: Always returns same test counts

---

## 📚 Documentation Files

1. **WORKSPACE_IMPLEMENTATION_SUMMARY.md** - Complete feature list
2. **WORKSPACE_API_REFERENCE.md** - Full API documentation
3. **QUICK_START_GUIDE.md** - This file
4. **DATABASE_SCHEMA.md** - Database structure
5. **REJECTION_FEEDBACK_WORKFLOW.md** - Rejection flow details

---

## 🎓 Learning Resources

### For Juniors:
- Focus on task completion
- Aim for >75% code coverage
- Read rejection feedback carefully
- Practice clean code submission

### For Seniors:
- Provide constructive feedback
- Use file and line-specific comments
- Balance approval speed with quality
- Remember: You cannot merge, only review

### For Managers:
- Create clear workspace names
- Assign appropriate tech areas
- Provide final quality checks
- Monitor team performance

---

## 🆘 Support

If you encounter issues:

1. Check error messages in browser console
2. Check backend terminal logs
3. Verify MongoDB is running
4. Check API documentation
5. Review implementation summary

---

## ✨ Next Steps

After successfully running the platform:

1. Create multiple workspaces
2. Test different project types
3. Simulate rejection workflow
4. Test coverage threshold warnings
5. Try all three user roles
6. Explore review modal features
7. Test task status transitions

---

**Happy Learning! 🎉**

The VIE platform simulates real software team workflows to help you understand:
- Code review processes
- Team collaboration
- Quality assurance
- Project management
- Role-based responsibilities

Practice, learn, and improve! 💪
