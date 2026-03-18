import mongoose from "mongoose";

const organizationInviteSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"],
      default: "PENDING",
    },
    expiresAt: { type: Date, required: true },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

organizationInviteSchema.index({ companyId: 1, status: 1, createdAt: -1 });
organizationInviteSchema.index({ expiresAt: 1 });

export const OrganizationInvite = mongoose.model("OrganizationInvite", organizationInviteSchema);
