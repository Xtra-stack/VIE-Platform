# Rejection Feedback Loop - Quick Reference

## What's New?

A complete rejection feedback system that allows Senior Developers to reject code with learning-focused feedback and Junior Developers to resubmit after addressing the feedback.

## Key Features Implemented

### 1. Mandatory Rejection Comments
- Seniors MUST provide a reason when rejecting
- Reason stored in CodeSubmission.rejectionFeedback

### 2. Optional File & Line Details
- Seniors can optionally specify which file to fix
- Line number can be provided for precise location
- Helps juniors quickly locate issues

### 3. Rejection Feedback Display
- Juniors see rejection card on dashboard
- Shows:
  - 🔴 REJECTED status badge
  - Reviewer role (SENIOR_DEV)
  - Timestamp of rejection
  - Full feedback message
  - Optional: File name and line number

### 4. Resubmit Workflow
- "Resubmit Changes" button appears for REJECTED submissions
- Opens modal showing original feedback
- Junior can see exactly what was criticized
- Form for updated code and files
- Auto-triggers build on resubmission

### 5. Submission Linking
- New resubmitted submission linked to original via `previousSubmissionId`
- Parent submission tracks `resubmissionCount`
- Full audit trail of feedback cycles

### 6. Status Flow
```
SUBMITTED 
  ↓
AWAITING_REVIEW
  ↓
[APPROVED → MERGED → DEPLOYED]
or
[REJECTED ← feedback from senior
  ↓
[Junior sees feedback card]
  ↓
[Clicks "Resubmit Changes"]
  ↓
RESUBMITTED
  ↓
[New build triggered]
  ↓
[Back to review cycle]
```

## Files Modified

### Backend
- `models/CodeSubmission.js` - Added rejection and resubmission fields
- `models/` - No new models (uses existing Review model)
- `services/review.service.js` - Enhanced reject() method
- `services/submission.service.js` - Added resubmit() method
- `controllers/submission.controller.js` - Added resubmit controller
- `routes/submissions.routes.js` - Added /resubmit endpoint
- `constants/status.js` - Added REJECTED, RESUBMITTED statuses

### Frontend
- `components/ReviewModal.jsx` - Added reject form with file/line inputs
- `dashboards/JuniorDashboard.jsx` - Added rejection card and resubmit modal
- `dashboards/SeniorDashboard.jsx` - Updated reject handler signature
- `services/api.js` - Added resubmitSubmission(), updated rejectReview()
- `styles/ReviewModal.css` - Added reject form styling
- `styles/BuildStatus.css` - Added rejection card and resubmit modal styles

## How It Works

### Senior Developer Flow
1. Open ReviewModal by clicking "Review Code"
2. Review code changes via DiffViewer
3. Click "Reject" button
4. Modal shows optional file/line inputs
5. Type mandatory rejection reason
6. Optionally fill file and line number
7. Click "Confirm Reject"
8. Rejection stored, junior notified

### Junior Developer Flow
1. See REJECTED submission with red card
2. Read feedback reason
3. Read optional file/line details
4. Click "Resubmit Changes"
5. See original feedback in modal
6. Update code based on feedback
7. Paste updated code snippet
8. Update file list if needed
9. Click "Submit Updated Code"
10. Build auto-triggers
11. Waits for new review

## API Endpoints

### New
- `POST /api/submissions/:submissionId/resubmit` - Resubmit rejected code

### Updated
- `POST /api/reviews/:submissionId/reject` - Now accepts fileName, lineNumber

## Database Fields Added

### CodeSubmission.rejectionFeedback
```javascript
{
  reason: String,           // Required: feedback message
  fileName: String,         // Optional: file to fix
  lineNumber: Number,       // Optional: line number
  reviewerRole: String,     // Who rejected
  rejectedAt: Date,         // When rejected
  rejectedBy: ObjectId      // Which reviewer
}
```

### CodeSubmission.resubmissionCount
- Track how many times code was resubmitted
- Starts at 0, increments each resubmission

### CodeSubmission.previousSubmissionId
- Link to original submission if this is a resubmission
- null if this is original submission

## Validation Rules

### Rejection Validation
- ✅ Comment is mandatory
- ✅ File and line are optional
- ✅ Only SENIOR_DEV or MANAGER can reject
- ✅ Must be project member

### Resubmission Validation
- ✅ Code snippet is mandatory
- ✅ Files changed are optional
- ✅ Only original submitter can resubmit
- ✅ Only from REJECTED status
- ✅ Project member verification
- ✅ No duplicate resubmit (already RESUBMITTED)

## Status Conditions

### Rejection Feedback Card Shows
- `submission.status === 'REJECTED'`
- `submission.rejectionFeedback exists`

### Resubmit Button Shows
- `submission.status === 'REJECTED'`

### Rejection Context in Modal
- Shows when opening resubmit modal
- Displays feedback reason, file, line

## Error Messages

| Scenario | Error Message |
|----------|--------------|
| No comment on reject | "Rejection reason is mandatory" |
| No code on resubmit | "codeSnippet is required" |
| Not original submitter | "Forbidden" |
| Not REJECTED status | "This submission cannot be resubmitted" |
| Not project member | "Forbidden" |

## Visual Indicators

### Status Badges
- `REJECTED` - Red background badge

### Rejection Card
- 🔴 Red circle icon
- Red left border
- Red text for "Changes Requested"

### Resubmit Button
- 🔄 Redo icon
- Orange/yellow color (warning)
- Labeled "Resubmit Changes"

### Resubmit Modal
- Fixed position overlay
- Dark theme matching dashboard
- Shows original feedback prominently
- Form for new code and files

## Testing Checklist

- [ ] Create submission as junior
- [ ] Approve submission as senior (should pass)
- [ ] Create another submission as junior
- [ ] Reject submission as senior with comment
- [ ] Verify rejection card appears on junior dashboard
- [ ] Verify rejection shows reason, role, timestamp
- [ ] Click "Resubmit Changes"
- [ ] Verify modal shows feedback
- [ ] Update code and submit
- [ ] Verify build triggers on new submission
- [ ] Verify new submission has RESUBMITTED status
- [ ] Verify parent has resubmissionCount = 1
- [ ] Activity log shows both rejection and resubmission

## Performance Notes

- Rejections processed synchronously
- Resubmissions trigger builds asynchronously
- Reviews created automatically (no extra round trip)
- Dashboard loads efficiently with parallel API calls
- Modals only render when needed

## Security Notes

- JWT auth required for all endpoints
- Role-based access control enforced
- Only project members can review/reject
- Only submitter can resubmit
- Rejection data immutable once stored
- Full audit trail of all actions

## Future Enhancement Ideas

1. Rejection templates for common issues
2. Email notifications on rejection
3. Analytics on most common feedback
4. Auto-merge after N successful resubmissions
5. Feedback helpfulness ratings
6. Side-by-side diff of changes vs feedback
7. Suggestion engine for addressing feedback
8. Review timeline UI

## Support & Questions

For issues with the rejection feedback system:
1. Check servers are running (backend :3000, frontend :5173)
2. Review error messages in browser console
3. Check backend logs for API errors
4. Verify JWT tokens valid
5. Ensure user has correct role (JUNIOR, SENIOR_DEV, MANAGER)
6. Verify user is member of project

## Documentation Files

- `REJECTION_FEEDBACK_IMPLEMENTATION.md` - Detailed technical changes
- `REJECTION_FEEDBACK_WORKFLOW.md` - Complete user workflows and examples
- `QUICK_REFERENCE.md` - This file
