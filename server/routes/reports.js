const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ScanReport = require('../models/ScanReport');
const Project = require('../models/Project');

// Get all reports for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ message: 'Not found' });

    const reports = await ScanReport.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await ScanReport.findById(req.params.id).populate('projectId');
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Summary stats
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    const projectIds = projects.map(p => p._id);

    const totalScans = await ScanReport.countDocuments({ projectId: { $in: projectIds } });
    const blocked = await ScanReport.countDocuments({ projectId: { $in: projectIds }, status: 'blocked' });

    const allReports = await ScanReport.find({ projectId: { $in: projectIds } });
    const typeCounts = {};
    allReports.forEach(r => r.findings.forEach(f => {
      typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
    }));
    const mostCommon = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    res.json({
      totalScans,
      blocked,
      mostCommonIssue: mostCommon ? mostCommon[0] : 'None'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;