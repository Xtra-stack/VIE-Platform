import mongoose from 'mongoose';

const buildLogSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeSubmission',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'],
    default: 'QUEUED'
  },
  buildType: {
    type: String,
    enum: ['BUILD', 'TEST', 'LINT', 'FULL'],
    default: 'FULL'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  duration: {
    type: Number, // in milliseconds
  },
  logs: {
    type: String,
    default: ''
  },
  exitCode: {
    type: Number
  },
  testResults: {
    total: Number,
    passed: Number,
    failed: Number,
    skipped: Number,
    coverage: Number
  },
  artifacts: [{
    name: String,
    path: String,
    size: Number,
    type: String // 'BUNDLE', 'REPORT', 'COVERAGE', 'BUILD'
  }],
  environment: {
    node: String,
    npm: String,
    os: String
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate duration before saving
buildLogSchema.pre('save', function(next) {
  if (this.startedAt && this.completedAt) {
    this.duration = this.completedAt - this.startedAt;
  }
  next();
});

// Instance methods
buildLogSchema.methods.start = function() {
  this.status = 'RUNNING';
  this.startedAt = new Date();
  return this.save();
};

buildLogSchema.methods.complete = function(success, logs, testResults = null) {
  this.status = success ? 'SUCCESS' : 'FAILED';
  this.completedAt = new Date();
  this.logs = logs;
  this.exitCode = success ? 0 : 1;
  if (testResults) {
    this.testResults = testResults;
  }
  return this.save();
};

buildLogSchema.methods.fail = function(error, logs = '') {
  this.status = 'FAILED';
  this.completedAt = new Date();
  this.error = error;
  this.logs = logs;
  this.exitCode = 1;
  return this.save();
};

export default mongoose.model('BuildLog', buildLogSchema);
