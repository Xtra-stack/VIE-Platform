import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true },
		fullName: { type: String, required: true, trim: true },

		role: { type: String, enum: Object.values(ROLES), required: true },
		companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
		department: { type: String, trim: true },

		isActive: { type: Boolean, default: true },
		joinedAt: { type: Date, default: Date.now },
		lastLogin: { type: Date },

		canReview: { type: Boolean, default: false },
		canDeploy: { type: Boolean, default: false },
		canApproveDeployment: { type: Boolean, default: false },

		avatar: { type: String },
		bio: { type: String },
	},
	{ timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

export const User = mongoose.model("User", userSchema);
