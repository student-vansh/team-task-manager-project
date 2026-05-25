# Deployment Guide — Team Task Manager

Yeh guide **free tier** par deploy karne ke liye hai:

| Service | Use |
|---------|-----|
| **MongoDB Atlas** | Database (cloud) |
| **Render** | Backend (Node.js API) |
| **Vercel** | Frontend (React) |

**Order:** Pehle database → phir backend → phir frontend.

---

## Step 0 — GitHub par code push karo

1. GitHub par naya repository banao (e.g. `team-task-manager`).
2. Project folder se push karo:

```bash
cd team-task-manager
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
git push -u origin main
```

> `.env` files **kabhi commit mat karo**. Sirf `.env.example` commit karo.

---

## Step 1 — MongoDB Atlas (Database)

1. [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) par account banao.
2. **Create Cluster** → free **M0** tier choose karo.
3. **Database Access** → Add user (username + password yaad rakho).
4. **Network Access** → **Add IP Address** → `0.0.0.0/0` (sab IPs allow — deploy ke liye zaroori).
5. **Database** → **Connect** → **Drivers** → connection string copy karo:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
```

`USERNAME`, `PASSWORD`, aur database name apne hisaab se replace karo.

---

## Step 2 — Backend on Render

1. [https://render.com](https://render.com) par sign up karo (GitHub se connect karo).
2. **New +** → **Web Service**.
3. Apna GitHub repo connect karo.
4. Settings:

| Field | Value |
|-------|--------|
| **Name** | `team-task-api` (kuch bhi) |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

5. **Environment Variables** add karo:

| Key | Value |
|-----|--------|
| `MONGO_URI` | Atlas wala connection string |
| `SESSION_SECRET` | Koi lamba random string (e.g. `mySuperSecretKey123!@#`) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Abhi khali chhod do — Step 3 ke baad Vercel URL daaloge |
| `PORT` | Render khud set karta hai — optional |

6. **Create Web Service** → deploy hone do (5–10 min).
7. Backend URL copy karo, jaise: `https://team-task-api.onrender.com`

**Test:** Browser mein kholo — error page OK hai; API `https://YOUR-API.onrender.com/api/auth/me` par JSON aana chahiye.

> Free Render service **sleep** ho jati hai — pehli request par 30–60 sec lag sakta hai.

---

## Step 3 — Frontend on Vercel

1. [https://vercel.com](https://vercel.com) par sign up (GitHub connect).
2. **Add New Project** → apna repo import karo.
3. Settings:

| Field | Value |
|-------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment Variables:**

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://team-task-api.onrender.com` (apna Render URL) |

5. **Deploy** → URL milega jaise: `https://team-task-manager.vercel.app`

---

## Step 4 — Backend par Frontend URL update karo

Render dashboard → apni service → **Environment**:

- `FRONTEND_URL` = `https://team-task-manager.vercel.app` (apna Vercel URL, **trailing slash ke bina**)

**Save** → service **manual redeploy** karo (Render → Manual Deploy).

Yeh step **zaroori** hai — bina iske login cookies kaam nahi karengi (CORS error).

---

## Step 5 — Test karo

1. Vercel URL kholo.
2. **Sign up** → naya account banao.
3. **Login** karo.
4. Dashboard / Projects check karo.

Agar login fail ho:

- Browser DevTools → **Network** → failed request dekho.
- `FRONTEND_URL` backend par exact Vercel URL hai ya nahi check karo.
- `VITE_API_URL` frontend par exact Render URL hai ya nahi check karo.

---

## Environment Variables Summary

### Backend (Render)

```env
MONGO_URI=mongodb+srv://...
SESSION_SECRET=long_random_secret
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-api.onrender.com
```

---

## Local vs Production

| | Local | Production |
|--|-------|------------|
| Frontend | `http://localhost:5173` | `https://xxx.vercel.app` |
| Backend | `http://localhost:5000` | `https://xxx.onrender.com` |
| DB | Local Mongo / Atlas | MongoDB Atlas |
| API URL | `.env` → `VITE_API_URL` | Vercel env vars |

Local run:

```bash
# backend/.env
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# frontend/.env
VITE_API_URL=http://localhost:5000
```

---

## Alternatives

| Platform | Backend | Frontend |
|----------|---------|----------|
| **Railway** | Web service (repo root `backend`) | Static / Vercel |
| **Fly.io** | Docker / Node | Vercel |
| **Netlify** | — | `frontend` folder, build `dist` |

MongoDB hamesha **Atlas** use karna sabse easy hai.

---

## Common Errors

### CORS error
- `FRONTEND_URL` galat ya missing hai.
- URL mein extra `/` mat rakho end par.

### Login ho jata hai par refresh par logout
- Session MongoDB store use ho raha hai (`connect-mongo`) — code mein already hai.
- `SESSION_SECRET` production par set hona chahiye.

### 401 on every API call
- `withCredentials: true` frontend par hai (already set).
- Cookie `SameSite=None; Secure` production par chahiye (already set when `NODE_ENV=production`).

### Render slow / timeout
- Free tier cold start — pehli request wait karo.
- Paid plan ya [UptimeRobot](https://uptimerobot.com) se ping karwa sakte ho (optional).

---

## Security checklist (production)

- [ ] Strong `SESSION_SECRET`
- [ ] Atlas user ka strong password
- [ ] `.env` git mein commit nahi
- [ ] Atlas IP whitelist production par tighten kar sakte ho (optional)

---

## Quick diagram

```
User Browser
    ↓
Vercel (React)  ──API calls──→  Render (Express + Passport)
                                      ↓
                               MongoDB Atlas
```

---

**Author:** Vansh Kumar

Agar kisi step par atak jao, error screenshot / message bhejo — us hisaab se fix bata sakte hain.
