import mongoose from "mongoose";
import { REVIEW_STATUS } from "../constants/status.js";

const reviewSchema = new mongoose.Schema(
	{
		submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "CodeSubmission", required: true },
		projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
		reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		reviewerRole: { type: String, required: true },

		status: {
			type: String,
			enum: Object.values(REVIEW_STATUS),
			default: REVIEW_STATUS.PENDING,
		},

		overallComment: { type: String, trim: true },
		
		// Line-level comments with suggestions
		lineComments: [
			{
				lineNumber: { type: Number },
				issue: { type: String },
				suggestedFix: { type: String },
				createdAt: { type: Date, default: Date.now },
			}
		],
		
		// Legacy inline comments (kept for compatibility)
		inlineComments: {
			type: [
				{
					lineNumber: { type: Number },
					file: { type: String },
					comment: { type: String },
					createdAt: { type: Date, default: Date.now },
				},
			],
			default: [],
		},

		// Review checklist
		checklist: {
			logic: { type: Boolean, default: false },
			security: { type: Boolean, default: false },
			performance: { type: Boolean, default: false },
			readability: { type: Boolean, default: false },
			tests: { type: Boolean, default: false },
		},

		// Risk management
		riskFlag: { type: Boolean, default: false },
		riskNotes: { type: String, trim: true },

		decision: { type: String, default: "PENDING" },
		requestedAt: { type: Date, default: Date.now },
		startedAt: { type: Date },
		completedAt: { type: Date },
		
		// Manager-specific fields
		managerComment: { type: String, trim: true },
		riskAccepted: { type: Boolean, default: false },
		overrideSeniorDecision: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

reviewSchema.index({ submissionId: 1, reviewerRole: 1 });
reviewSchema.index({ reviewerId: 1, status: 1 });

export const Review = mongoose.model("Review", reviewSchema);
