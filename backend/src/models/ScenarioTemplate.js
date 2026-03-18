import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  content: { type: String, default: '' },
});

const ScenarioTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  tags: { type: [String], default: [] },
  files: { type: [FileSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ScenarioTemplate', ScenarioTemplateSchema);
