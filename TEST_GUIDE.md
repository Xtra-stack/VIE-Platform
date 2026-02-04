# VIE 2.0 - Quick Test Guide

## Server Status
- **Backend**: Running on `http://localhost:3000` ✅
- **Frontend**: Running on `http://localhost:5173` ✅
- **Database**: MongoDB connected ✅

## Test Workflow

### Step 1: Login
1. Open `http://localhost:5173` in Chrome
2. Login with:
   - **Junior**: `junior1` / `password123`
   - **Senior**: `senior1` / `password123`
   - **Manager**: `manager1` / `password123`

### Step 2: Submit Code (as Junior)
1. Navigate to Junior Dashboard
2. Fill out form:
   - **Project**: Select any project
   - **Branch**: `feature/test-code`
   - **Target**: `develop`
   - **Title**: `Add authentication system`
   - **Description**: `Implemented user login with JWT`
   - **Code Snippet**: Paste any multi-line code
   - **Files Changed**: 
     ```
     src/auth.js
     src/controllers/user.controller.js
     tests/auth.test.js
     ```
3. Click "Submit Code"
4. Verify success message
5. See submission in "My Submissions" list
6. Click "View Code" button - should see line-numbered code in modal
7. Click "Full Details" button - should see complete detail page with activity timeline

### Step 3: Review Code (as Senior)
1. Logout, login as `senior1`
2. Navigate to Senior Dashboard
3. Click "Review" on pending submission
4. View inline code (should show line-numbered code)
5. Write overall comment
6. Check all checklist items (logic, security, performance, readability, tests)
7. Optionally flag as high-risk
8. Click "Approve"
9. Verify activity log shows senior approval

### Step 4: Manager Approval (as Manager)
1. Logout, login as `manager1`
2. Navigate to Manager Dashboard
3. Click "Review" on submission awaiting approval
4. View the code
5. **Required**: Write a decision comment (mandatory field)
6. Optionally accept the risk
7. Click "Approve"
8. Verify success and activity updated

### Step 5: Merge & Deploy (as Manager)
1. Still logged in as manager
2. View the submission detail page again
3. Click "🔀 Merge" button
4. Wait for confirmation
5. Click "🚀 Deploy" button
6. Verify submission status changes to `DEPLOYED`
7. Check activity timeline - should show merge and deploy actions

### Step 6: Review Activity Timeline
1. On submission detail page, scroll to "Activity Timeline"
2. Should see events in reverse chronological order:
   - Deploy 🚀
   - Merge 🔀
   - Approve ✅ (from manager)
   - Approve ✅ (from senior)
   - Submit 📤 (from junior)
3. Each event shows:
   - Actor username and role
   - Timestamp
   - Action description
   - Metadata (files count, risk flags, etc.)

---

## What to Expect

### ✅ Working Features
- Line-numbered code display
- Activity timeline showing all events
- Manager approval with required comments
- Merge and deploy buttons
- Complete submission detail page
- All actions logged and immutable

### ⏳ To Be Completed (Backend Ready)
- Senior Dashboard: Line-level comment UI with checklist
- Manager Dashboard: Enhanced UI with all new fields
- Full integration of lineComments in review flow

### 🔄 Backward Compatibility
- Old submissions with `codeSnippet` still work
- Frontend auto-converts to line format
- No data loss during transition

---

## Developer Notes

### API Endpoints Available
```
POST   /api/submissions              - Create submission
GET    /api/submissions              - List submissions
GET    /api/submissions/:id          - Get submission details
GET    /api/submissions/:id/activity - Get activity log
POST   /api/submissions/:id/merge    - Merge submission (manager only)
POST   /api/submissions/:id/deploy   - Deploy submission (manager only)

POST   /api/reviews/:id/approve      - Approve with checklist, line comments, risk
POST   /api/reviews/:id/reject       - Reject with line comments
POST   /api/reviews/:id/manager/approve - Manager approval with comment
POST   /api/reviews/:id/manager/reject  - Manager rejection with comment
```

### Database Collections
- `codesubmissions` - Now with codeLines array
- `reviews` - Now with lineComments, checklist, risk fields
- `activitylogs` - New immutable audit trail

### Tested Scenarios
✅ Code submission with multi-line code parsing
✅ Code viewer with line numbers
✅ Submission detail page display
✅ Activity timeline rendering
✅ Manager comment requirement enforcement
✅ Backend status constants updated

---

## Troubleshooting

**Issue**: Code not showing line numbers
- **Fix**: Ensure codeSnippet contains newlines (`\n`), or use new codeLines format

**Issue**: Activity timeline not showing
- **Fix**: Check browser console for errors, verify activitylogs collection in MongoDB

**Issue**: Manager can't approve
- **Fix**: Must provide managerComment in the approval request (now required)

**Issue**: Merge/Deploy buttons disabled
- **Fix**: Submission must be in `MANAGER_APPROVED` status first

---

**Ready to test!** 🎉

Start with Junior submission → Senior review → Manager approval → Merge → Deploy
