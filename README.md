<div align="center">

```
██╗███╗   ██╗████████╗███████╗██████╗ ███╗   ██╗███████╗██╗  ██╗██╗███████╗██╗     ██████╗
██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗████╗  ██║██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
██║██╔██╗ ██║   ██║   █████╗  ██████╔╝██╔██╗ ██║███████╗███████║██║█████╗  ██║     ██║  ██║
██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗██║╚██╗██║╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
██║██║ ╚████║   ██║   ███████╗██║  ██║██║ ╚████║███████║██║  ██║██║███████╗███████╗██████╔╝
╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝
```

### **Stop bad code from reaching production. Before it ever gets the chance.**

<br/>

![Deploy](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![AI](https://img.shields.io/badge/AI-Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)
![Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Live](https://img.shields.io/badge/Live-internshield--five.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

### 🔗 [**internshield-five.vercel.app**](https://internshield-five.vercel.app/)

</div>

---

<br/>

## **What Is InternShield?**

InternShield is a **full-stack, AI-powered deployment safety gate** that hooks into your GitHub repositories and automatically audits every push and pull request — before any of it reaches your production server.

It scans for hardcoded secrets, vulnerable dependencies, debug artifacts, and risky patterns. Then it uses **Groq's LLaMA** to explain every finding in plain English and suggest an exact fix. If the risk score is too high, the deployment is **blocked at the commit level** — automatically.

> *No more "oops I pushed my API key." No more "I forgot to remove console.log(password)."*

<br/>

---

<br/>

## **CI/CD Is the Core Idea Here**

> This project was built to demonstrate a real understanding of what CI/CD actually means — not just "push code and it deploys," but the practice of **catching problems automatically, at every stage of the pipeline, before they become production incidents.**

**The pipeline I implemented follows the exact shape of a real CI/CD flow:**

```
Developer pushes code
        │
        ▼
GitHub Webhook fires ──────────────────────────────────────────────┐
        │                                                           │
        ▼                                                           │
Static Analysis (scanner.js)          <- Continuous Integration    │
  ├── Hardcoded secrets                                             │
  ├── Missing .env variables                                        │
  ├── Debug mode artifacts                                          │
  ├── Sensitive console.log calls                                   │
  └── TODO/FIXME comments                                           │
        │                                                           │
        ▼                                                           │
Dependency Audit (npm audit API)      <- Security Gate             │
  ├── Critical vulnerabilities                                      │
  └── High/Medium severity packages                                 │
        │                                                           │
        ▼                                                           │
AI Explanation (Groq LLaMA)            <- Developer Feedback Loop   │
  ├── Plain English explanation                                     │
  └── Exact fix suggestion                                          │
        │                                                           │
        ▼                                                           │
Risk Score Calculation                <- Quality Gate              │
  ├── Score 0–30  → ✅ Low  → Allowed                              │
  ├── Score 31–60 → ⚠️ Medium → Allowed with warning               │
  └── Score 61+   → ❌ High  → BLOCKED                             │
        │                                                           │
        ▼                                                           │
GitHub Commit Status API              <- Continuous Delivery Gate  │
  ├── High Risk   → status: failure (merge blocked)                │
  └── Low/Medium  → status: success (merge allowed)                │
        │                                                           │
        ▼                                                           │
PR Comment Posted + Email Alert       <- Notification Layer        │
        │                                                           │
        ▼                                                           │
Report Saved to MongoDB               <- Audit Trail               │
        │                                                           └─ (async, non-blocking)
        ▼
Dashboard Updated
```

## **Feature Overview**

<br/>

### 🔐 Static Code Scanner

Five categories of checks run on every changed file:

| Check | What It Catches |
|---|---|
| **Hardcoded Secrets** | API keys, tokens, passwords embedded in source code using regex pattern matching |
| **Missing Env Variables** | `process.env.X` calls where `X` is not defined in the `.env` file |
| **Debug Mode** | `DEBUG=true`, `morgan()` left on, `debugger;` statements in production config |
| **Sensitive Console Logs** | `console.log(password)`, `console.log(token)` — data that shouldn't be logged |
| **TODO Comments** | `// TODO`, `// FIXME`, `// HACK` left in production code |

<br/>

### 📦 Dependency Vulnerability Scanner

Reads `package.json` from the pushed code, calls the **npm audit API**, and flags:
- Critical severity packages (+20 pts each)
- High severity packages (+10 pts each)
- Medium severity packages (+5 pts each)

<br/>

### 🤖 Groq AI Explanation Engine

Every finding gets sent to **Groq's LLaMA** (ultra-fast inference) with a structured prompt requesting JSON output:

```json
{
  "findings": [
    {
      "index": 1,
      "explanation": "Plain English explanation of what the problem is",
      "fix": "Exact, actionable fix suggestion with code example"
    }
  ],
  "summary": "Overall security posture summary"
}
```

No vague warnings. Every issue comes with a specific fix.

<br/>

### 📊 Risk Scoring Engine

```
Hardcoded Secret      → +35 pts
Missing .env Variable → +25 pts
Critical Dependency   → +20 pts
Debug Mode            → +15 pts
High Dependency       → +10 pts
Sensitive console.log → +10 pts
Medium Dependency     →  +5 pts
TODO Comment          →  +5 pts

────────────────────────────────
0 – 30   →  ✅  Low Risk    → Deploy allowed
31 – 60  →  ⚠️  Medium Risk → Deploy allowed (warning posted)
61+      →  ❌  High Risk   → Deploy BLOCKED + email sent
```

<br/>

### 💬 GitHub PR Comment

After every scan, InternShield posts a formatted Markdown comment directly on the PR or commit — including the risk score, every finding with its GPT explanation, and the suggested fix. The developer sees exactly what's wrong and how to fix it without leaving GitHub.

<br/>

### ✅ GitHub Commit Status

Uses the **GitHub Statuses API** to set the commit state:
- `High Risk` → `state: failure` → **merge button is greyed out**
- `Low / Medium` → `state: success` → merge is allowed

This integrates directly with GitHub branch protection rules.

<br/>

---

<br/>

## **Tech Stack**

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Recharts, React Router v6 |
| **Backend** | Node.js, Express, JWT Auth |
| **Database** | MongoDB, Mongoose |
| **AI** | Groq API (LLaMA) — ultra-fast inference for security explanations |
| **Integrations** | GitHub Webhooks, GitHub REST API, npm audit API |
| **Email** | Nodemailer + Gmail SMTP |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **Local Dev** | ngrok for webhook tunneling |

<br/>

---

<br/>

## **Deployment**

| Service | URL |
|---|---|
| **Frontend** | [internshield-five.vercel.app](https://internshield-five.vercel.app/) |
| **Backend** | Deployed on Render |
| **Database** | MongoDB Atlas |

### Environment Variables Required

```env
# Server
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=gsk_...
GITHUB_WEBHOOK_SECRET=your_webhook_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=https://your-app.vercel.app
SERVER_URL=https://your-api.onrender.com
```

<br/>

---

<br/>

## **Local Setup**

```bash
# Clone
git clone https://github.com/yourusername/internshield
cd internshield

# Backend
cd server && npm install
cp .env.example .env    # fill in your values
npm start

# Frontend (new terminal)
cd client && npm install
npm start

# Webhook tunnel (new terminal)
npx ngrok http 5000
# Copy HTTPS URL → set as SERVER_URL in server/.env
```

<br/>

---

<br/>


## **Database Schema**

```
User          → id, email, password (bcrypt), githubToken, createdAt
Project       → id, userId, repoName, repoUrl, webhookId, enabledChecks
ScanReport    → id, projectId, commitSha, branch, filesScanned,
                findings[], riskScore, riskLevel, status, gptSummary, createdAt
```

<br/>

---

<br/>

## **Future Contributions**

This project is open for ideas, improvements, and extensions. A few directions worth exploring:

| Idea | Description |
|---|---|
| **Multi-language support** | Extend the static scanner beyond JS/TS to cover Python, Go, and Java codebases — each with their own secret patterns, debug idioms, and env-var conventions |
| **Custom rule engine** | Let teams define their own scan rules via a config file (`.internshield.yml`) checked into the repo — so org-specific patterns and banned imports can be enforced automatically |
| **Slack / Discord alerts** | Push scan results to a team channel the moment a scan completes, so the whole team is aware of blocked deployments without checking email |

Pull requests are welcome. If you're adding a new scanner check or integration, open an issue first to discuss the approach.

<br/>

---

<br/>

<div align="center">

**Built to understand that CI/CD is not a deployment tool — it's a discipline.**

*The pipeline is the product.*

<br/>

Made with care · Deployed on Vercel + Render · Powered by Groq

</div>
