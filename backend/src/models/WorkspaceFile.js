import mongoose from "mongoose";

const workspaceFileSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    
    // File type
    fileType: {
      type: String,
      enum: ["BASE_CODE", "WORKING_COPY"],
      required: true
    },
    
    // File metadata
    fileName: { type: String, required: true },
    filePath: { type: String, required: true }, // relative path within workspace
    fileSize: { type: Number }, // in bytes
    
    // Content (for small files, or store file path for larger files)
    content: { type: String }, // file content
    storagePath: { type: String }, // physical file system path
    
    // Version control
    version: { type: Number, default: 1 },
    
    // Upload info
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
    
    // Read-only flag for base code
    isReadOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

workspaceFileSchema.index({ workspaceId: 1, fileType: 1 });
workspaceFileSchema.index({ workspaceId: 1, filePath: 1 }, { unique: true });

export const WorkspaceFile = mongoose.model("WorkspaceFile", workspaceFileSchema);
