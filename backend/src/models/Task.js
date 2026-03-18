import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    
    // Task details
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    projectType: {
      type: String,
      enum: ["NEW_FEATURE", "NEW_PROJECT", "BUG_FIX", "UPDATE", "ENHANCEMENT"],
      required: true
    },
    techArea: {
      type: String,
      enum: ["FRONTEND", "BACKEND", "FULLSTACK"],
      required: true
    },
    
    // Assignment
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Junior
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Manager
    
    // Status tracking
    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "CHANGES_REQUESTED", "APPROVED"],
      default: "ASSIGNED"
    },
    
    // Linked submission (when Junior submits code)
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "CodeSubmission" },
    
    // Dates
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ workspaceId: 1, createdAt: -1 });

export const Task = mongoose.model("Task", taskSchema);
