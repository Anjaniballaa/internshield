const axios = require('axios');

const BASE = 'https://api.github.com';

function headers(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };
}

async function getFilesFromPush(payload, token) {
  const files = [];
  const repoName = payload.repository.full_name;
  const commits = payload.commits || [];

  for (const commit of commits) {
    const changed = [...(commit.added || []), ...(commit.modified || [])];
    for (const filepath of changed) {
      const supportedExt = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env'];
      if (!supportedExt.some(ext => filepath.endsWith(ext))) continue;

      try {
        const res = await axios.get(
          `${BASE}/repos/${repoName}/contents/${filepath}`,
          { headers: headers(token), params: { ref: commit.id } }
        );
        const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
        files.push({ path: filepath, content });
      } catch (e) {
        console.error(`Could not fetch file ${filepath}:`, e.message);
      }
    }
  }

  return files;
}

async function getLatestCommitFiles(repoName, token) {
  // For manual scans — get files from latest commit
  const commitsRes = await axios.get(
    `${BASE}/repos/${repoName}/commits`,
    { headers: headers(token), params: { per_page: 1 } }
  );
  const sha = commitsRes.data[0]?.sha;
  if (!sha) return { files: [], sha: null, branch: 'main' };

  const commitRes = await axios.get(
    `${BASE}/repos/${repoName}/commits/${sha}`,
    { headers: headers(token) }
  );

  const files = [];
  const supportedExt = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env'];

  for (const file of commitRes.data.files || []) {
    if (!supportedExt.some(ext => file.filename.endsWith(ext))) continue;
    try {
      const res = await axios.get(
        `${BASE}/repos/${repoName}/contents/${file.filename}`,
        { headers: headers(token), params: { ref: sha } }
      );
      const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
      files.push({ path: file.filename, content });
    } catch (e) {
      console.error(`Could not fetch ${file.filename}`);
    }
  }

  return { files, sha, branch: commitsRes.data[0]?.sha };
}

async function postPRComment(repoName, token, prNumber, report) {
  const findings = report.findings.slice(0, 10); // limit comment length
  const body = `## 🛡️ InternShield Scan Report

**Risk Score:** ${report.riskScore} | **Level:** ${getRiskEmoji(report.riskLevel)} ${report.riskLevel} | **Status:** ${report.status === 'blocked' ? '❌ BLOCKED' : '✅ ALLOWED'}

### Summary
${report.gptSummary}

### Findings (${report.findings.length} total)
${findings.map(f => `- **${f.type}** in \`${f.file}\` (line ${f.line || 'N/A'}): ${f.message}
  > 💡 ${f.gptFix || 'Review manually'}`).join('\n')}

${report.findings.length > 10 ? `\n_...and ${report.findings.length - 10} more. View full report in InternShield dashboard._` : ''}`;

  try {
    await axios.post(
      `${BASE}/repos/${repoName}/issues/${prNumber}/comments`,
      { body },
      { headers: headers(token) }
    );
  } catch (e) {
    console.error('PR comment failed:', e.message);
  }
}

async function setCommitStatus(repoName, token, sha, status, description) {
  try {
    await axios.post(
      `${BASE}/repos/${repoName}/statuses/${sha}`,
      {
        state: status === 'blocked' ? 'failure' : 'success',
        description: description || `InternShield: ${status}`,
        context: 'internshield/security-scan'
      },
      { headers: headers(token) }
    );
  } catch (e) {
    console.error('Status check failed:', e.message);
  }
}

function getRiskEmoji(level) {
  return { Low: '✅', Medium: '⚠️', High: '❌' }[level] || '';
}

module.exports = { getFilesFromPush, getLatestCommitFiles, postPRComment, setCommitStatus };