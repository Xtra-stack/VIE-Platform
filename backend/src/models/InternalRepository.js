import mongoose from "mongoose";

const internalRepositorySchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    repositoryPath: { type: String, required: true },
    defaultBranch: { type: String, default: "main" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const InternalRepository = mongoose.model("InternalRepository", internalRepositorySchema);
