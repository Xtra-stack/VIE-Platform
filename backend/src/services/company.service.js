import { Company } from "../models/Company.js";

export class CompanyService {
  async createCompany(data) {
    const existing = await Company.findOne();
    if (existing) {
      const error = new Error("Company already exists");
      error.status = 409;
      throw error;
    }

    const company = await Company.create(data);
    return company;
  }

  async listCompanies() {
    return Company.find();
  }

  async getCompanyById(companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }
    return company;
  }
}
