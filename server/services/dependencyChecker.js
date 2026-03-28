const axios = require('axios');

async function checkDependencies(packageJsonContent) {
  const findings = [];
  let pkg;

  try {
    pkg = JSON.parse(packageJsonContent);
  } catch {
    return findings;
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  try {
    // npm audit requires a package-lock.json in practice — we simulate via registry advisories
    // Use the npm audit endpoint (POST with package-lock format is complex, so we use bulk advisory)
    const response = await axios.post(
      'https://registry.npmjs.org/-/npm/v1/security/advisories/bulk',
      { packages: Object.keys(deps) },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const advisories = response.data;
    Object.entries(advisories).forEach(([pkg, advisoryList]) => {
      advisoryList.forEach(adv => {
        findings.push({
          type: 'vulnerable_dependency',
          file: 'package.json',
          line: null,
          message: `${pkg}: ${adv.title} (${adv.severity})`,
          severity: adv.severity
        });
      });
    });
  } catch (err) {
    console.error('Dep check error:', err.message);
  }

  return findings;
}

module.exports = { checkDependencies };