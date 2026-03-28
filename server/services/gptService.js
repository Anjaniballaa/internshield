const Groq = require('groq-sdk');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGptExplanations(findings) {
  if (findings.length === 0) {
    return {
      findings: [],
      summary: 'No issues found. This deployment looks clean and safe to proceed.'
    };
  }

  const prompt = `You are a security code review expert. Analyze these code findings and return a JSON object.

Findings:
${JSON.stringify(findings, null, 2)}

Return ONLY valid JSON in this exact format, no markdown, no backticks:
{
  "findings": [
    {
      "index": 0,
      "explanation": "Plain English explanation of what the problem is",
      "fix": "Exact code fix suggestion"
    }
  ],
  "summary": "2-3 sentence overall summary of the security posture"
}`;

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const raw = response.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    
    // Safety check — if parsing fails, return fallback instead of crashing
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Groq returned invalid JSON:', cleaned.slice(0, 200));
      throw new Error('Invalid JSON from Groq');
    }

    // Make sure findings array exists
    if (!parsed.findings) parsed.findings = [];
    if (!parsed.summary) parsed.summary = 'Analysis complete.';

    return parsed;

  } catch (err) {
    console.error('Groq error:', err.message);
    return {
      findings: findings.map((_, i) => ({
        index: i,
        explanation: 'Could not generate explanation',
        fix: 'Please review manually'
      })),
      summary: 'AI analysis unavailable'
    };
  }
}

module.exports = { getGptExplanations };