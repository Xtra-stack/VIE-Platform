import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    
    // Project Type
    projectType: {
      type: String,
      enum: ["NEW_FEATURE", "NEW_PROJECT", "BUG_FIX", "UPDATE", "ENHANCEMENT"],
      required: true
    },
    
    // Tech Area
    techArea: {
      type: String,
      enum: ["FRONTEND", "BACKEND", "FULLSTACK"],
      required: true
    },
    
    // Team Assignment
    assignedJuniors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignedSeniors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Status
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "ARCHIVED"],
      default: "ACTIVE"
    },
    
    // Base code (for updates/bug fixes)
    hasBaseCode: { type: Boolean, default: false },
    baseCodePath: { type: String }, // /workspaces/{workspaceId}/base-code/
    workingCopyPath: { type: String }, // /workspaces/{workspaceId}/working-copy/
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

workspaceSchema.index({ projectId: 1, status: 1 });
workspaceSchema.index({ companyId: 1, createdAt: -1 });

export const Workspace = mongoose.model("Workspace", workspaceSchema);
