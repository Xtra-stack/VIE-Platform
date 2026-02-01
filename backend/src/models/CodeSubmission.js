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

		status: {
			type: String,
			enum: Object.values(SUBMISSION_STATUS),
			default: SUBMISSION_STATUS.SUBMITTED,
		},

		submittedAt: { type: Date, default: Date.now },
		resolvedAt: { type: Date },
	},
	{ timestamps: true }
);

codeSubmissionSchema.index({ projectId: 1, submittedAt: -1 });
codeSubmissionSchema.index({ submittedBy: 1, submittedAt: -1 });

export const CodeSubmission = mongoose.model("CodeSubmission", codeSubmissionSchema);
