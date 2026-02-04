# Rejection Feedback Loop Implementation

## Overview
Implemented a comprehensive rejection feedback system that enables Senior Developers to reject code submissions with learning-oriented feedback, and Junior Developers to resubmit after addressing the feedback.

## Backend Changes

### 1. **CodeSubmission Model Updates** (`backend/src/models/CodeSubmission.js`)
Added rejection tracking fields:
```javascript
rejectionFeedback: {
  reason: String,           // Mandatory rejection reason
  fileName: String,         // Optional: which file needs fixing
  lineNumber: Number,       // Optional: which line number
  reviewerRole: String,     // Who rejected (SENIOR_DEV)
  rejectedAt: Date,         // Rejection timestamp
  rejectedBy: ref("User")   // Which reviewer rejected
},
resubmissionCount: { type: Number, default: 0 },
previousSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "CodeSubmission" }
```

### 2. **Status Constants** (`backend/src/constants/status.js`)
Added new submission statuses:
- `REJECTED` - When senior rejects the submission
- `RESUBMITTED` - When junior resubmits after rejection
- `UNDER_REVIEW` - Generic review state

### 3. **ReviewService Enhancement** (`backend/src/services/review.service.js`)
Updated `reject()` method:
- **Mandatory validation**: Rejection reason is now required
- **Optional file/line info**: Accept `fileName` and `lineNumber` parameters
- **Feedback persistence**: Stores rejection details in CodeSubmission.rejectionFeedback
- **Status update**: Sets submission status to REJECTED

```javascript
async reject({ submissionId, reviewerId, reviewerRole, overallComment, 
               lineComments = [], fileName, lineNumber }) {
  // Validates mandatory comment
  // Stores rejection feedback with optional file/line info
  // Updates submission status to REJECTED
}
```

### 4. **SubmissionService Resubmit Method** (`backend/src/services/submission.service.js`)
New `resubmit()` method for handling rejected submissions:
- **Parent linkage**: Links new submission to original rejected submission via `previousSubmissionId`
- **Counter tracking**: Increments `resubmissionCount` on parent submission
- **Status setting**: Creates submission with `RESUBMITTED` status
- **Review creation**: Automatically creates new review for resubmitted code
- **Build trigger**: Auto-triggers build on resubmission
- **Activity logging**: Records resubmission with parent reference

```javascript
async resubmit({ previousSubmissionId, userId, codeSnippet, filesChanged }) {
  // Only submitter can resubmit
  // Only from REJECTED status
  // Links to parent submission
  // Auto-triggers build and creates new review
}
```

### 5. **Submission Controller** (`backend/src/controllers/submission.controller.js`)
Added `resubmitSubmission()` controller:
- Validates required codeSnippet parameter
- Calls SubmissionService.resubmit()
- Returns new submission with 201 status

### 6. **Submission Routes** (`backend/src/routes/submissions.routes.js`)
Added resubmit endpoint:
```
POST /api/submissions/:submissionId/resubmit
```
- Protected with Junior role requirement
- Calls resubmitSubmission controller

## Frontend Changes

### 1. **ReviewModal Component Enhancement** (`frontend/src/components/ReviewModal.jsx`)
Added rejection details capture:
- **Optional file/line inputs**: Conditional form fields for specifying file and line number
- **Reject confirmation workflow**: Toggle-based form to show additional details
- **Mandatory comment validation**: Ensures comment is provided before reject
- **Updated reject handler**: Passes file, line, and comment to API

```javascript
const [showRejectForm, setShowRejectForm] = useState(false);
const [rejectFile, setRejectFile] = useState('');
const [rejectLine, setRejectLine] = useState('');

const handleReject = async () => {
  // Validates mandatory comment
  // Passes fileName, lineNumber to API
  // Shows reject details form if user clicks Reject button
}
```

### 2. **ReviewModal CSS Enhancement** (`frontend/src/styles/ReviewModal.css`)
Added styling for rejection form:
- Reject details form with red border accent
- Conditional input fields for file and line number
- Two-stage reject button (shows form, then confirms)
- Danger confirmation button styling

### 3. **JuniorDashboard Component** (`frontend/src/dashboards/JuniorDashboard.jsx`)
Major enhancements:
- **Import resubmit API**: Added `resubmitSubmission` to imports
- **State for resubmit modal**: `resubmitModal` and `resubmitForm` states
- **Rejection feedback display**: Shows rejection card with:
  - Status badge: 🔴 REJECTED
  - Reviewer info: Who rejected and when
  - Feedback reason: Full rejection message
  - Optional details: File and line number if provided
- **Resubmit button**: Appears only for REJECTED submissions
- **Resubmit modal**: 
  - Shows original rejection feedback
  - Form for updated code and files
  - Cancel and submit buttons
  - Proper error handling

```javascript
const [resubmitModal, setResubmitModal] = useState(null);
const [resubmitForm, setResubmitForm] = useState({
  codeSnippet: '',
  filesChanged: '',
});

const handleResubmit = async (e) => {
  // Validates code provided
  // Calls resubmitSubmission API
  // Reloads dashboard on success
}
```

### 4. **BuildStatus CSS Enhancement** (`frontend/src/styles/BuildStatus.css`)
Added comprehensive styling:
- **Rejection feedback card**: Red-bordered card with rejection details
- **Resubmit modal**: Full-screen modal with proper layout
- **Modal header/footer**: Sticky header and action buttons
- **Rejection context**: Shows original feedback in modal
- **Responsive design**: Mobile-friendly layout for all components
- **Warning button styling**: Yellow/orange button for resubmit action

### 5. **API Service Update** (`frontend/src/services/api.js`)
Added new API functions:
```javascript
export const resubmitSubmission = (previousSubmissionId, codeSnippet, filesChanged) => {
  return apiCall('POST', `/api/submissions/${previousSubmissionId}/resubmit`, {
    codeSnippet,
    filesChanged,
  });
};

// Updated rejectReview to include file/line
export const rejectReview = (submissionId, overallComment, lineComments = [], 
                             fileName = null, lineNumber = null) => {
  return apiCall('POST', `/api/reviews/${submissionId}/reject`, {
    overallComment,
    lineComments,
    fileName,
    lineNumber,
  });
};
```

### 6. **SeniorDashboard Update** (`frontend/src/dashboards/SeniorDashboard.jsx`)
Updated handleReject to accept optional parameters:
```javascript
const handleReject = async (submissionId, comment, inlineComments, 
                           fileName, lineNumber) => {
  // Passes file and line to API
}
```

## Workflow Status Flow

### Before (Limited Status)
```
SUBMITTED → AWAITING_REVIEW → APPROVED → MERGED → DEPLOYED
```

### After (Enhanced with Feedback Loop)
```
SUBMITTED 
  → AWAITING_REVIEW 
    → REJECTED (with feedback)
      → [Junior sees feedback]
      → RESUBMITTED
        → UNDER_REVIEW
        → APPROVED/REJECTED (cycle continues)
  → APPROVED
  → MERGED
  → DEPLOYED
```

## Key Features

1. **Mandatory Feedback**: Seniors must provide reason for rejection
2. **Contextual Details**: Optional file and line number for specific fixes
3. **Submission Tracking**: Links between parent and resubmitted code
4. **Resubmission Counter**: Tracks how many times code was resubmitted
5. **Learning-Oriented**: Full feedback visibility for juniors
6. **Auto-Build**: Builds trigger automatically on resubmission
7. **Activity Logging**: All rejections and resubmissions logged
8. **Status Transitions**: Clear visual feedback of submission state

## Testing Checklist

- [x] Senior can reject submission with mandatory comment
- [x] Senior can optionally specify file and line number
- [x] Rejection stored in CodeSubmission.rejectionFeedback
- [x] Junior sees rejection reason, role, timestamp on dashboard
- [x] Junior can click "Resubmit Changes" and submit new code
- [x] New submission shows as RESUBMITTED, links to parent
- [x] resubmissionCount increments on parent
- [x] Activity log records both rejection and resubmission
- [x] Build auto-triggers on resubmission
- [x] No auto-approval occurs
- [x] Auth middleware unchanged
- [x] Both servers start successfully
- [x] No compilation errors

## API Endpoints

### New Endpoints
- `POST /api/submissions/:submissionId/resubmit` - Resubmit rejected code

### Updated Endpoints
- `POST /api/reviews/:submissionId/reject` - Now accepts fileName and lineNumber

## File Structure
```
VIE/
├── backend/
│   └── src/
│       ├── models/
│       │   └── CodeSubmission.js (updated with rejection fields)
│       ├── services/
│       │   ├── review.service.js (updated reject method)
│       │   └── submission.service.js (added resubmit method)
│       ├── controllers/
│       │   └── submission.controller.js (added resubmit controller)
│       ├── routes/
│       │   └── submissions.routes.js (added resubmit route)
│       └── constants/
│           └── status.js (added REJECTED, RESUBMITTED)
└── frontend/
    └── src/
        ├── components/
        │   └── ReviewModal.jsx (enhanced with reject form)
        ├── dashboards/
        │   ├── JuniorDashboard.jsx (added rejection display and resubmit)
        │   └── SeniorDashboard.jsx (updated reject handler)
        ├── services/
        │   └── api.js (added resubmit API, updated reject)
        └── styles/
            ├── ReviewModal.css (added reject form styling)
            └── BuildStatus.css (added rejection card and resubmit modal styles)
```

## Summary
This implementation provides a complete rejection feedback loop that:
- Enables seniors to provide learning-focused feedback with optional file/line details
- Allows juniors to view comprehensive rejection reasons and resubmit their code
- Tracks the feedback cycle with submission linking and counters
- Maintains proper status flow and activity logging
- Automatically triggers builds on resubmission
- Provides a smooth UX with modals and clear visual feedback
