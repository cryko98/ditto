# 🤖 Ditto — Self-Building App Agent (Vercel)

## 🚀 Deploy (3 lépés)

### 1. GitHub
```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/USER/ditto.git
git push -u origin main
```

### 2. Vercel
[vercel.com](https://vercel.com) → **Add New Project** → repo kiválasztása → **Deploy**

### 3. Environment Variable
**Settings → Environment Variables:**

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

➡ Mentés után: **Redeploy**

---

## 💻 Helyi futtatás
```bash
pip install flask anthropic
export ANTHROPIC_API_KEY=sk-ant-...
python api/index.py
# → http://localhost:5000
```

## 📁 Struktúra
```
ditto/
├── api/
│   └── index.py      ← Flask app + agent + frontend HTML (minden egyben)
├── requirements.txt  ← flask, anthropic
├── vercel.json       ← Vercel routing
└── .gitignore
```
