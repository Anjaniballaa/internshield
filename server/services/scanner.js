const PATTERNS = {
  hardcodedSecret: [
    { regex: /(['"`])[A-Za-z0-9_\-]{20,}(['"`])/g, desc: 'Possible hardcoded secret/token' },
    { regex: /api[_-]?key\s*[:=]\s*['"`][^'"` ]{8,}/gi, desc: 'Hardcoded API key' },
    { regex: /password\s*[:=]\s*['"`][^'"` ]{4,}/gi, desc: 'Hardcoded password' },
    { regex: /secret\s*[:=]\s*['"`][^'"` ]{4,}/gi, desc: 'Hardcoded secret' },
    { regex: /token\s*[:=]\s*['"`][^'"` ]{8,}/gi, desc: 'Hardcoded token' },
    { regex: /AKIA[0-9A-Z]{16}/g, desc: 'AWS Access Key' },
    { regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, desc: 'Private key in code' }
  ],
  debugMode: [
    { regex: /DEBUG\s*=\s*true/gi, desc: 'Debug mode enabled' },
    { regex: /app\.use\(morgan\(/g, desc: 'Morgan logger left in production' },
    { regex: /console\.debug\(/g, desc: 'console.debug left in code' }
  ],
  sensitiveConsole: [
    { regex: /console\.log\(.*?(password|token|secret|key|auth)/gi, desc: 'console.log with sensitive data' }
  ],
  todoFixme: [
    { regex: /\/\/\s*(TODO|FIXME|HACK|XXX):/gi, desc: 'TODO/FIXME comment in production' }
  ]
};

function scanFile(filename, content) {
  const findings = [];
  const lines = content.split('\n');

  const check = (type, patterns, severity) => {
    patterns.forEach(({ regex, desc }) => {
      lines.forEach((line, idx) => {
        regex.lastIndex = 0;
        if (regex.test(line)) {
          findings.push({ type, file: filename, line: idx + 1, message: desc, severity });
        }
      });
    });
  };

  check('hardcoded_secret', PATTERNS.hardcodedSecret, 'critical');
  check('debug_mode', PATTERNS.debugMode, 'high');
  check('sensitive_console', PATTERNS.sensitiveConsole, 'medium');
  check('todo_fixme', PATTERNS.todoFixme, 'low');

  return findings;
}

function scanEnvUsage(filename, content, envFileContent) {
  const findings = [];
  const envVarRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
  const definedVars = new Set();

  if (envFileContent) {
    envFileContent.split('\n').forEach(line => {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
      if (match) definedVars.add(match[1]);
    });
  }

  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    let m;
    envVarRegex.lastIndex = 0;
    while ((m = envVarRegex.exec(line)) !== null) {
      const varName = m[1];
      if (definedVars.size > 0 && !definedVars.has(varName)) {
        findings.push({
          type: 'missing_env',
          file: filename,
          line: idx + 1,
          message: `process.env.${varName} used but not found in .env`,
          severity: 'high'
        });
      }
    }
  });

  return findings;
}
// Entropy calculation — makes detection smarter
function shannonEntropy(str) {
  const freq = {};
  for (const c of str) freq[c] = (freq[c] || 0) + 1;
  return Object.values(freq).reduce((e, f) => {
    const p = f / str.length;
    return e - p * Math.log2(p);
  }, 0);
}

function scanForHighEntropyStrings(filename, content) {
  const findings = [];
  const lines = content.split('\n');
  // Match any quoted string longer than 20 chars
  const stringRegex = /['"`]([A-Za-z0-9+/=_\-]{20,})['"`]/g;

  lines.forEach((line, idx) => {
    let match;
    stringRegex.lastIndex = 0;
    while ((match = stringRegex.exec(line)) !== null) {
      const entropy = shannonEntropy(match[1]);
      // Entropy > 4.5 means very random = likely a real secret
      if (entropy > 4.5) {
        findings.push({
          type: 'high_entropy_string',
          file: filename,
          line: idx + 1,
          message: `High entropy string detected (entropy: ${entropy.toFixed(2)}) — likely a hardcoded secret`,
          severity: 'high'
        });
      }
    }
  });

  return findings;
}

module.exports = { scanFile, scanEnvUsage, scanForHighEntropyStrings };