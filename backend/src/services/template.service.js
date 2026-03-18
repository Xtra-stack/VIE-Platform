import ScenarioTemplate from '../models/ScenarioTemplate.js';

export const listTemplates = async () => {
  return ScenarioTemplate.find().sort({ createdAt: -1 }).lean().exec();
};

export const getTemplateById = async (id) => {
  return ScenarioTemplate.findById(id).lean().exec();
};

export const createTemplate = async (payload) => {
  const doc = new ScenarioTemplate(payload);
  await doc.save();
  return doc;
};

export const generateFromTemplate = async (id, options = {}) => {
  const tpl = await getTemplateById(id);
  if (!tpl) throw new Error('Template not found');

  // Allow simple substitutions via options.substitutions (key->value)
  const subs = options.substitutions || {};
  const files = (tpl.files || []).map((f) => {
    let content = f.content || '';
    Object.entries(subs).forEach(([k, v]) => {
      content = content.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
    return { filename: f.filename, content };
  });

  return { name: tpl.name, description: tpl.description, files };
};
