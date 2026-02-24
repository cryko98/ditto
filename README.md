# 🤖 Ditto — Self-Building App Agent (Vercel Edition)

A Vercel-ready version of [yoheinakajima/ditto](https://github.com/yoheinakajima/ditto) — the self-building Flask coding agent, adapted for serverless deployment.

## 🚀 Deploy to Vercel (3 steps)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ditto-vercel.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Click **Deploy** (no build settings needed — Vercel auto-detects)

### 3. Add Environment Variable

In Vercel project settings → **Environment Variables**:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-your-key-here` |

Redeploy after adding the variable.

---

## 🔧 Local Development

```bash
pip install flask anthropic
export ANTHROPIC_API_KEY=sk-ant-your-key-here
cd api && python index.py
# Open http://localhost:5000
```

---

## 📁 Project Structure

```
ditto-vercel/
├── api/
│   └── index.py        ← Flask backend + Ditto agent (Vercel serverless)
├── public/
│   └── index.html      ← Frontend UI (Builder + Preview)
├── requirements.txt    ← Python dependencies
├── vercel.json         ← Vercel routing config
└── .gitignore
```

## ⚙️ How it Works

1. You describe your app in the Builder panel
2. The **Claude claude-opus-4-6 agent** plans and builds it using file-creation tools
3. All files are generated **in-memory** (no filesystem writes needed)
4. The generated HTML is assembled and injected into the preview iframe
5. You can download the result as a standalone HTML file

## 🔑 Supported Models

Uses Claude claude-opus-4-6 by default. Requires `ANTHROPIC_API_KEY`.

## ⚠️ Vercel Free Tier Notes

- **60s timeout** on serverless functions — complex apps may hit this limit
- **No persistent storage** — generated apps live in memory per-request
- Sessions are stored in-memory (cleared on cold start)
- For best results, keep app descriptions concise and specific
