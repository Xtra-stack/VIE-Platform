import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		role: { type: String, required: true },
		joinedAt: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const projectSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

		repositoryPath: { type: String },
		gitRemoteUrl: { type: String },

		members: { type: [projectMemberSchema], default: [] },

		mainBranch: { type: String, default: "main" },
		branchProtection: {
			mainBranchLocked: { type: Boolean, default: true },
			requireReview: { type: Boolean, default: true },
			requiredReviewers: { type: Number, default: 1 },
		},

		validationRules: {
			commitMessageFormat: { type: String },
			blockedKeywords: { type: [String], default: [] },
			minCommitMessageLength: { type: Number, default: 10 },
			filePatterns: {
				allowed: { type: [String], default: [] },
				blocked: { type: [String], default: [] },
			},
		},

		cicdEnabled: { type: Boolean, default: true },
		testCommand: { type: String, default: "npm test" },
		testTimeout: { type: Number, default: 900000 },

		deploymentEnvironments: {
			type: [
				{
					name: { type: String },
					branch: { type: String },
					autoDeployOnApproval: { type: Boolean, default: false },
				},
			],
			default: [],
		},

		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

projectSchema.index({ slug: 1, companyId: 1 }, { unique: true });

export const Project = mongoose.model("Project", projectSchema);
