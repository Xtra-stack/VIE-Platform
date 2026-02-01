import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    timezone: { type: String, default: "UTC" },
    country: { type: String, trim: true },
    maxProjects: { type: Number, default: 1 },
    maxUsers: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
