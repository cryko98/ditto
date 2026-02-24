# 🤖 Ditto — Self-Building App Agent (Vercel)

## 🚀 Deploy in 3 steps

### 1. GitHub-ra feltöltés
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USER/ditto.git
git push -u origin main
```

### 2. Vercel import
[vercel.com](https://vercel.com) → **Add New Project** → importáld a repot → **Deploy**

### 3. Environment Variable
Vercel Dashboard → Project → **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

**Redeploy** a változó mentése után.

---

## 📁 Struktúra

```
ditto-vercel/
├── api/
│   └── index.py       ← Flask app + Ditto agent (Vercel Python serverless)
├── public/
│   └── index.html     ← Frontend UI
├── requirements.txt   ← flask, anthropic
├── vercel.json        ← Routing config
└── .gitignore
```

## 💻 Helyi fejlesztés

```bash
pip install flask anthropic
export ANTHROPIC_API_KEY=sk-ant-...
cd api && python index.py
# → http://localhost:5000
```
