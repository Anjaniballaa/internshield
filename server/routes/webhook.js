const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Project = require('../models/Project');
const User = require('../models/User');
const { runFullScan } = require('../services/scanOrchestrator');

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

router.post('/', async (req, res) => {
  if (!verifySignature(req))
    return res.status(401).json({ message: 'Invalid signature' });

  const event = req.headers['x-github-event'];
  const payload = JSON.parse(req.body.toString());

  // Only handle push and pull_request events
  if (!['push', 'pull_request'].includes(event))
    return res.status(200).json({ message: 'Event ignored' });

  const repoFullName = payload.repository?.full_name;
  if (!repoFullName) return res.status(200).json({ message: 'No repo' });

  // Find matching project
  const project = await Project.findOne({ repoName: repoFullName });
  if (!project) return res.status(200).json({ message: 'No matching project' });

  const user = await User.findById(project.userId);

  // Respond to GitHub immediately, run scan async
  res.status(200).json({ message: 'Scan started' });

  try {
    await runFullScan(project, user.githubToken, payload);
  } catch (err) {
    console.error('Scan error:', err.message);
  }
});

module.exports = router;