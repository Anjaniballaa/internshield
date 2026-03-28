const WEIGHTS = {
  hardcoded_secret: 35,
  missing_env: 25,
  vulnerable_dependency_critical: 20,
  vulnerable_dependency_high: 10,
  debug_mode: 15,
  sensitive_console: 10,
  todo_fixme: 5
};

function calculateRisk(findings) {
  let score = 0;

  findings.forEach(f => {
    if (f.type === 'vulnerable_dependency') {
      if (f.severity === 'critical') score += WEIGHTS.vulnerable_dependency_critical;
      else if (f.severity === 'high') score += WEIGHTS.vulnerable_dependency_high;
    } else {
      score += WEIGHTS[f.type] || 0;
    }
  });

  let level = 'Low';
  if (score > 60) level = 'High';
  else if (score > 30) level = 'Medium';

  return { score, level, status: level === 'High' ? 'blocked' : 'allowed' };
}

module.exports = { calculateRisk };