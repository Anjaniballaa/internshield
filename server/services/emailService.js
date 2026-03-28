const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendHighRiskEmail(to, repoName, score, reportId) {
  try {
    await transporter.sendMail({
      from: `"InternShield" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🚨 High Risk Deployment Blocked — ${repoName}`,
      html: `
        <h2>⚠️ InternShield Alert</h2>
        <p>A deployment to <strong>${repoName}</strong> has been <strong>BLOCKED</strong>.</p>
        <p><strong>Risk Score:</strong> ${score}/100+</p>
        <p><a href="${process.env.CLIENT_URL}/reports/${reportId}">View Full Report</a></p>
        <hr/>
        <p style="color:#888;font-size:12px">InternShield — AI-powered deployment safety</p>
      `
    });
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

module.exports = { sendHighRiskEmail };