import { Company } from "../models/Company.js";

export class CompanyService {
  async ensureTrialStatus(companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      return null;
    }

    if (company.trialStatus === "ACTIVE" && company.trialEndsAt && company.trialEndsAt < new Date()) {
      company.trialStatus = "EXPIRED";
      await company.save();
    }

    return company;
  }

  async createCompany(data) {
    const existing = await Company.findOne({ slug: data.slug });
    if (existing) {
      const error = new Error("Company slug already exists");
      error.status = 409;
      throw error;
    }

    const company = await Company.create(data);
    return company;
  }

  async listCompanies(companyId = null) {
    if (!companyId) {
      return Company.find();
    }
    return Company.find({ _id: companyId });
  }

  async getCompanyById(companyId) {
    const company = await this.ensureTrialStatus(companyId);
    if (!company) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }
    return company;
  }

  async completeTrial(companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }

    company.trialStatus = "COMPLETED";
    company.planType = "PAID";
    company.trialEndsAt = new Date();
    await company.save();

    return company;
  }
}
