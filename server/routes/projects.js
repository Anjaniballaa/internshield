const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const axios = require('axios');

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Connect a repo (register webhook)
router.post('/connect', auth, async (req, res) => {
  try {
    const { repoName, repoUrl, githubToken } = req.body;
    // e.g. repoName = "owner/repo"

    // Save github token to user
    await User.findByIdAndUpdate(req.user.id, { githubToken });

    // Register webhook on GitHub
    const webhookResponse = await axios.post(
      `https://api.github.com/repos/${repoName}/hooks`,
      {
        name: 'web',
        active: true,
        events: ['push', 'pull_request'],
        config: {
          url: `${process.env.BACKEND_URL}/api/webhook`,
          content_type: 'json',
          secret: process.env.GITHUB_WEBHOOK_SECRET
        }
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github+json'
        }
      }
    );

    const project = await Project.create({
      userId: req.user.id,
      repoName,
      repoUrl,
      webhookId: webhookResponse.data.id
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});

// Update settings
router.patch('/:id/settings', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { settings: req.body },
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Manual scan trigger
router.post('/:id/scan', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const user = await User.findById(req.user.id);
    const { runFullScan } = require('../services/scanOrchestrator');
    const report = await runFullScan(project, user.githubToken, null);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Project removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;