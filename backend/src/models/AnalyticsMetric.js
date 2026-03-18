import mongoose from 'mongoose';

const AnalyticsMetricSchema = new mongoose.Schema({
  type: { type: String, required: true },
  value: { type: Number, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AnalyticsMetric', AnalyticsMetricSchema);
