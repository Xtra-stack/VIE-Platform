import * as TemplateService from '../services/template.service.js';

export const listTemplates = async (req, res) => {
  try {
    const templates = await TemplateService.listTemplates();
    return res.json({ success: true, data: templates });
  } catch (err) {
    console.error('listTemplates error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const tpl = await TemplateService.getTemplateById(req.params.id);
    if (!tpl) return res.status(404).json({ error: 'not_found' });
    return res.json({ success: true, data: tpl });
  } catch (err) {
    console.error('getTemplate error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const generateTemplate = async (req, res) => {
  try {
    const { templateId } = req.body;
    if (!templateId) return res.status(400).json({ error: 'templateId required' });

    const result = await TemplateService.generateFromTemplate(templateId, { substitutions: req.body.substitutions || {} });
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('generateTemplate error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const payload = req.body;
    const doc = await TemplateService.createTemplate(payload);
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error('createTemplate error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};
