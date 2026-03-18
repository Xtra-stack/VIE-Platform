# VIE Platform - Quick Test Commands

## 🚀 Start the Platform

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB at mongodb://localhost:27017/vie
✅ Server running on http://localhost:3000
```

### Terminal 2: Start Frontend (optional, for manual testing)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0 ready in 123 ms
  ➜  Local:   http://localhost:5173/
```

---

## ✅ Phase 5: Test Email System

### Test 1: Simple Email Test

**Command:**
```bash
curl -X POST http://localhost:3000/api/invitations/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_EMAIL@example.com"}'
```

**Expected Result (Success):**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "<message-id@gmail.com>"
}
```

**Backend Console Should Show:**
```
🧪 TEST EMAIL ENDPOINT TRIGGERED
   Sending test email to: YOUR_EMAIL@example.com

📧 Attempting to send email to: YOUR_EMAIL@example.com
   Subject: Test Email from VIE Platform
✅ Email sent successfully to YOUR_EMAIL@example.com
   MessageId: <message-id@gmail.com>
```

**Check Your Email:**
- Look in inbox for "Test Email from VIE Platform"
- If not found, check spam folder

---

## 📧 Phase 4: Full Invitation Flow

### Test 2: Login as Manager

**Command:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "manager1", "password": "manager123"}'
```

**Response (save the token):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "manager1",
      "email": "manager1@company.com",
      "fullName": "Manager One",
      "role": "MANAGER",
      "companyId": "507f1f77bcf86cd799439010"
    }
  }
}
```

**Save Token:** `export TOKEN="eyJhbGciOi..."`

---

### Test 3: Create a Workspace

First, get a project ID. Query the database or check existing projects:

```bash
# If you need a new project:
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Project",
    "description": "Test project for invitations",
    "type": "NEW_FEATURE",
    "techArea": "FULLSTACK"
  }'
```

**Response (save the project ID):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Test Project"
  }
}
```

**Save Project ID:** `export PROJECT_ID="507f1f77bcf86cd799439012"`

---

### Test 4: Create Workspace

```bash
curl -X POST http://localhost:3000/api/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Workspace - Invitations",
    "projectId": "'$PROJECT_ID'",
    "projectType": "NEW_FEATURE",
    "techArea": "FULLSTACK"
  }'
```

**Response (save the workspace ID):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Test Workspace - Invitations",
    "projectId": "507f1f77bcf86cd799439012"
  }
}
```

**Save Workspace ID:** `export WORKSPACE_ID="507f1f77bcf86cd799439013"`

---

### Test 5: Send Invitation

```bash
curl -X POST http://localhost:3000/api/invitations/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "workspaceId": "'$WORKSPACE_ID'",
    "fullName": "Test User",
    "email": "testuser@example.com",
    "role": "JUNIOR",
    "assignedDomain": "FRONTEND",
    "taskTitle": "Build Login Component",
    "taskPriority": "HIGH",
    "taskDeadline": "2024-12-31T23:59:59Z"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Member invited successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "username": "test_123",
      "email": "testuser@example.com",
      "fullName": "Test User",
      "role": "JUNIOR"
    },
    "task": {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Build Login Component",
      "priority": "HIGH",
      "status": "ASSIGNED"
    },
    "credentials": {
      "username": "test_123",
      "tempPassword": "a1b2c3d4e5f6g7h8"
    }
  }
}
```

**Backend Console Should Show:**
```
🔔 Sending invite email to: testuser@example.com
   Workspace: Test Workspace - Invitations
   Has temp password: true

📧 Attempting to send email to: testuser@example.com
   Subject: You've been invited to Test Workspace - Invitations - VIE
✅ Email sent successfully to testuser@example.com
   MessageId: <message-id@gmail.com>
```

**Save Credentials:**
```bash
export TEST_USERNAME="test_123"
export TEST_PASSWORD="a1b2c3d4e5f6g7h8"
```

**Check Email:**
- Should receive invitation with login credentials
- Contains login URL: `http://localhost:5173/login`

---

## 🔐 Test 6: New User Login

**Command:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "'$TEST_USERNAME'", "password": "'$TEST_PASSWORD'"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "username": "test_123",
      "email": "testuser@example.com",
      "fullName": "Test User",
      "role": "JUNIOR",
      "mustChangePassword": true,
      "firstLogin": true
    }
  }
}
```

**Note:** `mustChangePassword: true` indicates user must change password on first login

**Save New Token:** `export NEW_USER_TOKEN="eyJhbGciOi..."`

---

## 🔒 Test 7: Change Password (First Login)

```bash
curl -X POST http://localhost:3000/api/invitations/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_USER_TOKEN" \
  -d '{
    "oldPassword": "'$TEST_PASSWORD'",
    "newPassword": "NewPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Save New Password:** `export FINAL_PASSWORD="NewPassword123"`

---

## ✅ Test 8: Login with New Password

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "'$TEST_USERNAME'", "password": "'$FINAL_PASSWORD'"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "mustChangePassword": false,
      "firstLogin": false
    }
  }
}
```

---

## 📊 Verify Activity Logs

### Check if activities were logged:

```bash
# Get current user activity
curl -X GET http://localhost:3000/api/auth/activity \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "...",
        "userId": "...",
        "action": "LOGIN",
        "entityType": "AUTH",
        "description": "User logged in successfully",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 🐛 Troubleshooting Quick Fixes

### Email Test Failed?

**Check 1: Gmail credentials**
```bash
# Verify in .env:
cat backend/.env | grep EMAIL
```

Should show:
```
EMAIL_USER=vie.platform.code@gmail.com
EMAIL_PASS=kfghjogztraiecyx
```

**Check 2: Gmail App Password**
If using standard Gmail password, get App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy 16-character password (remove spaces)
4. Update `.env`: `EMAIL_PASS=xxxxxxxxxxxxxxxx`
5. Restart backend: `npm run dev`

**Check 3: Backend running?**
```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status": "ok", "service": "vie-backend"}
```

---

### Invitation Failed?

**Check 1: Is user a MANAGER?**
```bash
# Login, check response for role
curl -X POST http://localhost:3000/auth/login ...
# Look for "role": "MANAGER" in response
```

**Check 2: Workspace ID exists?**
```bash
# Query database:
# In MongoDB shell:
db.workspaces.find({_id: ObjectId("607f1f77bcf86cd799439013")})
# Should return document
```

**Check 3: Email syntax?**
```bash
# Invalid email format will fail
"email": "testuser@example.com"  # ✅ Correct
"email": "testuser"              # ❌ Wrong
```

---

### Password Change Failed?

**Check 1: Token expired?**
- Tokens expire after 24 hours (JWT_EXPIRY=1d in .env)
- Login again to get fresh token

**Check 2: Old password wrong?**
- Verify you're using the actual current password
- Case-sensitive

**Check 3: New password too short?**
- Must be at least 6 characters

---

## 📝 Test Summary Checklist

After running all tests, verify:

- [ ] Test email arrives in inbox
- [ ] Manager can login
- [ ] Workspace created successfully
- [ ] Invitation sent successfully
- [ ] Invitation email received
- [ ] New user can login with temp credentials
- [ ] New user has `mustChangePassword: true`
- [ ] Password change succeeds
- [ ] New user can login with new password
- [ ] Activity logs show login events
- [ ] No 500 errors in backend console
- [ ] Email shows in MongoDB InvitationLog as "SENT"

**If all checks pass:** ✅ Email & Invitation System Working!

---

## 🚀 Next Steps

1. **If tests pass:** 
   - Proceed to Phase 6: Dashboard cleanup
   - See PHASE_STATUS_UPDATE.md for next phase

2. **If tests fail:**
   - Check troubleshooting section above
   - Review backend console logs
   - Check MongoDB for created records
   - Verify .env configuration

3. **For full documentation:**
   - See EMAIL_INVITATION_TEST_GUIDE.md
   - See PHASE_STATUS_UPDATE.md

---

## 💡 Pro Tips

- Use `export` to save values and reuse them across commands
- Check backend console for detailed error messages
- MongoDB Compass helps visualize created records
- Check spam folder for emails (Gmail sometimes auto-archives test emails)
- Clear browser localStorage if seeing cached authentication issues

---

**Ready to test? Run:** `cd backend && npm run dev` then use Test 1 command above!

