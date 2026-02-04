# Rejection Feedback Loop - Complete Workflow

## User Scenarios

### Scenario 1: Senior Developer Rejects Code with Feedback

1. **Senior opens ReviewModal**
   - Sees submitted code via DiffViewer
   - Reviews code changes and build results

2. **Senior clicks "Reject" button**
   - Modal shows optional fields for file and line number
   - Textarea for mandatory rejection reason

3. **Senior provides feedback**
   - Types reason: "Need better error handling in the login function"
   - Optionally fills: File = "src/auth.js", Line = "42"
   - Clicks "Confirm Reject"

4. **System processes rejection**
   - Backend validates mandatory comment exists
   - Stores rejection in CodeSubmission.rejectionFeedback:
     ```javascript
     {
       reason: "Need better error handling in the login function",
       fileName: "src/auth.js",
       lineNumber: 42,
       reviewerRole: "SENIOR_DEV",
       rejectedAt: "2024-11-27T10:30:00Z",
       rejectedBy: "<reviewerId>"
     }
     ```
   - Updates submission status to REJECTED
   - Logs activity: "Rejected code with feedback"
   - ReviewModal closes

5. **Senior dashboard updates**
   - Submission moves from "PENDING" to rejected list
   - Success message: "Rejection sent. Developer will address the feedback."

---

### Scenario 2: Junior Developer Views Rejection and Resubmits

1. **Junior sees rejected submission**
   - Dashboard displays rejection card (red bordered)
   - Shows feedback: "Need better error handling in the login function"
   - Shows reviewer: "SENIOR_DEV"
   - Shows timestamp: "Nov 27, 2024, 10:30 AM"
   - Shows optional details: "File: src/auth.js, Line: 42"

2. **Junior clicks "Resubmit Changes"**
   - Modal opens showing:
     - Original title: "Add Login Validation"
     - Rejection context with full feedback
     - Input for updated code snippet
     - Input for updated files list
   - Junior reviews the feedback

3. **Junior updates code**
   - Implements better error handling as requested
   - Updates error messages
   - Pastes new code snippet in textarea
   - Updates file list if needed
   - Clicks "Submit Updated Code"

4. **System processes resubmission**
   - Backend validates code provided
   - Creates NEW CodeSubmission linked to rejected one:
     ```javascript
     {
       projectId: original.projectId,
       title: original.title,
       description: original.description,
       sourceBranch: original.sourceBranch,
       targetBranch: original.targetBranch,
       codeLines: [new lines],
       filesChanged: [updated files],
       previousSubmissionId: "<rejectedSubmissionId>",
       status: "RESUBMITTED",
       resubmissionCount: 1 (on original)
     }
     ```
   - Increments parent's resubmissionCount: 0 → 1
   - Auto-triggers build on new submission
   - Creates new Review for resubmission
   - Logs activity: "Resubmitted code after feedback"
   - Modal closes, dashboard reloads

5. **Dashboard shows progress**
   - Success message: "Code resubmitted successfully! Build started automatically."
   - New submission appears in "My Submissions" with RESUBMITTED status
   - Build status shows: ⚙️ Build RUNNING
   - When build completes:
     - If PASSED: ✅ Build SUCCESS, tests passed, coverage info
     - If FAILED: ❌ Build FAILED, error logs visible

---

### Scenario 3: Continued Feedback Loop

**If Senior Approves Resubmission:**
- Status flow: RESUBMITTED → UNDER_REVIEW → APPROVED
- Junior sees approved notification
- Code moves to Manager review

**If Senior Rejects Again:**
- New rejection feedback stored (different from first)
- Cycle repeats: Junior sees feedback → resubmits → builds → review
- resubmissionCount increments: 1 → 2
- Activity log shows both rejections and resubmissions

---

## Database Schema Changes

### CodeSubmission Document
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  repositoryId: ObjectId,
  submittedBy: ObjectId,
  sourceBranch: String,
  targetBranch: String,
  title: String,
  description: String,
  codeLines: Array,
  filesChanged: Array,
  status: "SUBMITTED" | "REJECTED" | "RESUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "MERGED" | "DEPLOYED",
  
  // Rejection feedback (NEW)
  rejectionFeedback: {
    reason: String,
    fileName: String,    // optional
    lineNumber: Number,  // optional
    reviewerRole: String,
    rejectedAt: Date,
    rejectedBy: ObjectId
  },
  
  // Resubmission tracking (NEW)
  resubmissionCount: Number,        // 0 if original, 1+ if resubmitted
  previousSubmissionId: ObjectId,   // ref to parent if resubmitted
  
  // Existing fields
  buildStatus: String,
  buildLogs: Array,
  testResults: Object,
  linesAdded: Number,
  linesRemoved: Number,
  submittedAt: Date,
  resolvedAt: Date,
  mergedBy: ObjectId,
  mergedAt: Date,
  deployedBy: ObjectId,
  deployedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Request/Response Examples

### 1. Reject Submission
**Request:**
```
POST /api/reviews/:submissionId/reject
Content-Type: application/json
Authorization: Bearer <token>

{
  "overallComment": "Need better error handling in the login function",
  "lineComments": [],
  "fileName": "src/auth.js",
  "lineNumber": 42
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b0c8e1a2b",
    "submissionId": "60d5ec49f1b2c72b0c8e1a1f",
    "status": "CHANGES_REQUESTED",
    "decision": "REJECTED",
    "overallComment": "Need better error handling in the login function",
    "lineComments": []
  }
}
```

### 2. Resubmit Code
**Request:**
```
POST /api/submissions/:submissionId/resubmit
Content-Type: application/json
Authorization: Bearer <token>

{
  "codeSnippet": "const login = async (email, password) => {\n  if (!email || !password) throw new Error('Missing credentials');\n  ...",
  "filesChanged": ["src/auth.js", "tests/auth.test.js"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49f1b2c72b0c8e1a3f",
    "projectId": "60d5ec49f1b2c72b0c8e0f1b",
    "submittedBy": "60d5ec49f1b2c72b0c8e0e1b",
    "title": "Add Login Validation",
    "status": "RESUBMITTED",
    "previousSubmissionId": "60d5ec49f1b2c72b0c8e1a1f",
    "resubmissionCount": 0,
    "buildStatus": "PENDING",
    "submittedAt": "2024-11-27T10:35:00Z"
  }
}
```

---

## UI Components & State Management

### ReviewModal Component
```javascript
State:
- comment: string (rejection reason)
- rejectFile: string (optional file)
- rejectLine: string (optional line)
- showRejectForm: boolean (toggle detail form)

Props:
- submission: CodeSubmission
- onReject: (submissionId, comment, inlineComments, fileName, lineNumber) => Promise

Behavior:
- Clicking Reject button shows optional file/line inputs
- Clicking Confirm Reject validates comment and submits
- ESC key or outside click closes modal
```

### JuniorDashboard Component
```javascript
State:
- submissions: Array<CodeSubmission>
- resubmitModal: { previousSubmissionId, title, rejection } | null
- resubmitForm: { codeSnippet, filesChanged }

Submission Display:
- For REJECTED submissions:
  - Shows rejection card with feedback
  - Shows "Resubmit Changes" button
  - Modal shows original feedback when clicked
- Build status displayed for all submissions
- Action buttons: View Code, Full Details, Resubmit (if REJECTED)

Behavior:
- Clicking Resubmit opens modal with feedback context
- Submitting form calls API and reloads dashboard
- Success message shown on resubmission
```

---

## Activity Logging

### Rejection Log Entry
```javascript
{
  actorId: "<reviewerId>",
  actorRole: "SENIOR_DEV",
  actionType: "reject",
  entityType: "CodeSubmission",
  entityId: "<submissionId>",
  message: "Rejected code with feedback",
  details: {
    reason: "Need better error handling",
    fileName: "src/auth.js",
    lineNumber: 42
  },
  timestamp: Date
}
```

### Resubmission Log Entry
```javascript
{
  actorId: "<juniorId>",
  actorRole: "JUNIOR",
  actionType: "resubmit",
  entityType: "CodeSubmission",
  entityId: "<newSubmissionId>",
  message: "Resubmitted code after feedback",
  details: {
    previousSubmissionId: "<rejectedSubmissionId>",
    resubmissionNumber: 1
  },
  timestamp: Date
}
```

---

## Error Handling

### Invalid Rejection (Missing Comment)
**Response:**
```json
{
  "success": false,
  "error": "Rejection reason is mandatory"
}
```

### Invalid Resubmission (Not REJECTED)
**Response:**
```json
{
  "success": false,
  "error": "This submission cannot be resubmitted"
}
```

### Invalid Resubmission (Wrong User)
**Response:**
```json
{
  "success": false,
  "error": "Forbidden"
}
```

---

## Submission Status Transitions

### Valid Transitions
```
SUBMITTED → AWAITING_REVIEW
AWAITING_REVIEW → REJECTED
REJECTED → RESUBMITTED (via resubmit API)
RESUBMITTED → UNDER_REVIEW
UNDER_REVIEW → APPROVED
UNDER_REVIEW → REJECTED (can reject again)
APPROVED → MERGED
MERGED → DEPLOYED
```

### Invalid Transitions
```
REJECTED → SUBMITTED (can't go back to original)
APPROVED → REJECTED (not allowed)
MERGED → REJECTED (not allowed)
DEPLOYED → * (final state)
```

---

## Performance Considerations

1. **Build Triggering**: Builds auto-trigger asynchronously, don't block resubmit response
2. **Review Creation**: New review record created automatically on resubmission
3. **Dashboard Loading**: Loads submissions with build logs in parallel
4. **Modal Rendering**: Rejection card only renders if rejectionFeedback exists
5. **Activity Logging**: Async logging doesn't affect API response time

---

## Security Considerations

1. **Only submitter can resubmit**: Verified via JWT user ID
2. **Only SENIOR_DEV can reject**: Verified via role-based access control
3. **Rejection comment mandatory**: Server-side validation
4. **Rejection data immutable**: Once stored, cannot be modified
5. **Audit trail**: All actions logged with actor and timestamp
6. **Project membership**: Users can only see submissions for their projects

---

## Future Enhancements

1. **Rejection Templates**: Pre-defined feedback templates for seniors
2. **Notification System**: Email/in-app notifications on rejection
3. **Feedback Analytics**: Track most common rejection reasons
4. **Approval Workflows**: Auto-approve after N resubmissions without changes
5. **Review History**: Timeline view of all rejections and changes
6. **Diff Highlighting**: Show what changed between rejections and resubmissions
7. **Feedback Scoring**: Rate usefulness of feedback for learning insights
8. **Auto-Resubmit Suggestions**: AI suggestions for addressing feedback
