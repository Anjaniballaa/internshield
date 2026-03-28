const { scanFile, scanEnvUsage, scanForHighEntropyStrings } = require('./scanner');
const { checkDependencies } = require('./dependencyChecker');
const { getGptExplanations } = require('./gptService');
const { calculateRisk } = require('./riskEngine');
const { getFilesFromPush, getLatestCommitFiles, postPRComment, setCommitStatus } = require('./githubService');
const ScanReport = require('../models/ScanReport');
const { sendHighRiskEmail } = require('./emailService');
const Project = require('../models/Project');
const User = require('../models/User');

async function runFullScan(project, githubToken, webhookPayload) {
  let files = [];
  let commitSha = 'manual';
  let branch = 'main';
  let prNumber = null;

  if (webhookPayload) {
    if (webhookPayload.pull_request) {
      prNumber = webhookPayload.pull_request.number;
      commitSha = webhookPayload.pull_request.head.sha;
      branch = webhookPayload.pull_request.head.ref;
      const { files: f } = await getLatestCommitFiles(project.repoName, githubToken);
      files = f;
    } else {
      // push event
      commitSha = webhookPayload.after;
      branch = webhookPayload.ref?.replace('refs/heads/', '') || 'main';
      files = await getFilesFromPush(webhookPayload, githubToken);
    }
  } else {
    const result = await getLatestCommitFiles(project.repoName, githubToken);
    files = result.files;
    commitSha = result.sha || 'manual';
    branch = result.branch || 'main';
  }

  const envFile = files.find(f => f.path === '.env' || f.path.endsWith('/.env'));
  const packageJson = files.find(f => f.path === 'package.json');

  let allFindings = [];

  // Run static scanner on each file
  for (const file of files) {
  if (file.path.endsWith('.env')) continue;

  const fileFindings = scanFile(file.path, file.content);
  const envFindings = scanEnvUsage(file.path, file.content, envFile?.content || '');
  const entropyFindings = scanForHighEntropyStrings(file.path, file.content); // ADD THIS
  allFindings = [...allFindings, ...fileFindings, ...envFindings, ...entropyFindings]; // ADD entropyFindings
}


  // Dependency check
  if (packageJson) {
    const depFindings = await checkDependencies(packageJson.content);
    allFindings = [...allFindings, ...depFindings];
  }

  // GPT explanations
  const gptResult = await getGptExplanations(allFindings);

  // Merge GPT results back into findings
  const enrichedFindings = allFindings.map((f, i) => {
    const gpt = gptResult.findings.find(g => g.index === i);
    return { ...f, gptExplanation: gpt?.explanation || '', gptFix: gpt?.fix || '' };
  });

  // Risk scoring
  const { score, level, status } = calculateRisk(enrichedFindings);

  // Save report
  const report = await ScanReport.create({
    projectId: project._id,
    commitSha,
    branch,
    filesScanned: files.length,
    findings: enrichedFindings,
    riskScore: score,
    riskLevel: level,
    status,
    gptSummary: gptResult.summary
  });

  // GitHub integration
  if (githubToken && commitSha !== 'manual') {
    await setCommitStatus(project.repoName, githubToken, commitSha, status, `Risk: ${level} (${score} pts)`);
    if (prNumber) {
      await postPRComment(project.repoName, githubToken, prNumber, report);
    }
  }

  // Email if high risk
  if (level === 'High') {
    const user = await User.findById(project.userId);
    await sendHighRiskEmail(user.email, project.repoName, score, report._id.toString());
  }

  return report;
}

module.exports = { runFullScan };