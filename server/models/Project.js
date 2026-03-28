const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoName: { type: String, required: true },
  repoUrl: { type: String, required: true },
  webhookId: { type: Number },
  settings: {
    checkSecrets: { type: Boolean, default: true },
    checkEnv: { type: Boolean, default: true },
    checkDeps: { type: Boolean, default: true },
    checkDebug: { type: Boolean, default: true },
    checkConsole: { type: Boolean, default: true },
    checkTodos: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);