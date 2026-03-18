import mongoose from "mongoose";
import { SUBMISSION_STATUS } from "../constants/status.js";

const codeSubmissionSchema = new mongoose.Schema(
	{
		projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
		repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalRepository" },
		submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		sourceBranch: { type: String, required: true },
		targetBranch: { type: String, default: "main" },

		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		
		// Code snapshot reference (versioning & history)
		codeSnapshotId: { type: mongoose.Schema.Types.ObjectId, ref: "CodeSnapshot" },
		
		// Line-aware code storage
		codeLines: [
			{
				lineNumber: Number,
				content: String,
			}
		],
		filesChanged: [{ type: String }],

		// Build & Test tracking
		buildStatus: {
			type: String,
			enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'],
			default: 'PENDING'
		},
		buildLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BuildLog' }],
		buildStartedAt: { type: Date },
		buildCompletedAt: { type: Date },
		testResults: {
			total: Number,
			passed: Number,
			failed: Number,
			skipped: Number,
			coverage: Number
		},
		linesAdded: { type: Number, default: 0 },
		linesRemoved: { type: Number, default: 0 },

		status: {
			type: String,
			enum: Object.values(SUBMISSION_STATUS),
			default: SUBMISSION_STATUS.SUBMITTED,
		},

		submittedAt: { type: Date, default: Date.now },
		resolvedAt: { type: Date },
		
		// Approval/Rejection tracking
		approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		rejectionReason: { type: String, trim: true },
		
		// Rejection feedback (learning-oriented)
		rejectionFeedback: {
			reason: String,
			fileName: String,
			lineNumber: Number,
			reviewerRole: String,
			rejectedAt: Date,
			rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
		},
		
		// Resubmission tracking
		resubmissionCount: { type: Number, default: 0 },
		previousSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "CodeSubmission" },
		
		// Merge tracking
		mergedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		mergedAt: { type: Date },
		
		// Deployment tracking
		deployedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		deployedAt: { type: Date },
		
		// Skill tracking
		skillsAffected: [
			{
				skillName: {
					type: String,
					enum: ['Frontend', 'Backend', 'API Development', 'Testing', 'DevOps', 'Documentation', 'Communication']
				},
				xpAwarded: { type: Number, default: 0 },
				levelBefore: { type: Number, default: 1 },
				levelAfter: { type: Number, default: 1 }
			}
		],
	},
	{ timestamps: true }
);

codeSubmissionSchema.index({ projectId: 1, submittedAt: -1 });
codeSubmissionSchema.index({ submittedBy: 1, submittedAt: -1 });

export const CodeSubmission = mongoose.model("CodeSubmission", codeSubmissionSchema);
