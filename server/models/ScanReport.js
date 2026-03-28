const mongoose = require('mongoose');

const FindingSchema = new mongoose.Schema({
  type: String,
  file: String,
  line: Number,
  message: String,
  severity: String,
  gptExplanation: String,
  gptFix: String
});

const ScanReportSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  commitSha: String,
  branch: String,
  filesScanned: Number,
  findings: [FindingSchema],
  riskScore: Number,
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
  status: { type: String, enum: ['allowed', 'blocked'] },
  gptSummary: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanReport', ScanReportSchema);