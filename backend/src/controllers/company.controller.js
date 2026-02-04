import { CompanyService } from "../services/company.service.js";

const companyService = new CompanyService();

export const createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body || {});
    return res.status(201).json({ success: true, data: company });
  } catch (error) {
    return next(error);
  }
};

export const listCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies(req.user.companyId || null);
    return res.status(200).json({ success: true, data: companies });
  } catch (error) {
    return next(error);
  }
};

export const getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.companyId);
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    return next(error);
  }
};
