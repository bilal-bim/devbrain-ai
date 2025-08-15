# 🚀 DevBrain AI Deployment Guide

## Quick Deployment Steps

### 1. Backend Deployment (Railway)

Railway provides easy Node.js hosting with automatic deployments.

#### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   ```bash
   # First, push your code to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

3. **Connect to Railway**
   - Click "New Project" on Railway
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js

4. **Set Environment Variables**
   In Railway dashboard, add these variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

5. **Get your Backend URL**
   - Railway will provide a URL like: `https://devbrain-backend.up.railway.app`
   - Copy this URL for frontend configuration

### 2. Frontend Deployment (Vercel)

Vercel offers instant deployment for React apps.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? (your account)
   - Link to existing project? `N`
   - Project name? `devbrain-ai`
   - Directory? `./`
   - Build command? `npm run build`
   - Output directory? `dist`

3. **Set Environment Variable**
   ```bash
   vercel env add VITE_API_URL
   # Enter your Railway backend URL: https://devbrain-backend.up.railway.app
   ```

4. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

### 3. Alternative: One-Click Deploy

#### Backend (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the button above
2. Connect your GitHub repo
3. Set environment variables:
   - `OPENAI_API_KEY`
   - `FRONTEND_URL`

#### Frontend (Netlify)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Click the button above
2. Connect your GitHub repo
3. Set build settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
4. Add environment variable:
   - `VITE_API_URL` = Your backend URL

## 📝 Environment Variables

### Backend (.env)
```env
# Required
OPENAI_API_KEY=sk-...
PORT=3000
NODE_ENV=production

# CORS
FRONTEND_URL=https://devbrain-ai.vercel.app

# Optional - for MVI server
CLAUDE_API_KEY=sk-ant-...
```

### Frontend (.env.production)
```env
VITE_API_URL=https://devbrain-backend.up.railway.app
VITE_APP_NAME=DevbrainAI
```

## 🔧 Post-Deployment

1. **Test the Application**
   - Visit your frontend URL
   - Try sending a message
   - Check browser console for errors

2. **Monitor Logs**
   - Railway: Check logs in dashboard
   - Vercel: Use `vercel logs`

3. **Custom Domain (Optional)**
   - Railway: Add custom domain in settings
   - Vercel: Add domain in project settings

## 🐛 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend
- Check that backend allows your frontend domain

### API Connection Failed
- Verify `VITE_API_URL` points to correct backend
- Check backend is running (visit `/api/health`)

### Build Failures
- Ensure all dependencies are in `package.json`
- Check Node version compatibility (>=16)

## 🎉 Success!

Your app should now be live at:
- Frontend: `https://devbrain-ai.vercel.app`
- Backend API: `https://devbrain-backend.up.railway.app`

## 📊 Free Tier Limits

### Railway
- $5 free credits/month
- ~500 hours of runtime
- Automatic sleep after 10 min inactivity

### Vercel
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions included

### Render
- 750 hours/month free
- Auto-sleep after 15 min inactivity
- Automatic deploys from GitHub

## 🔒 Security Notes

1. **Never commit `.env` files**
2. **Use environment variables for secrets**
3. **Enable HTTPS (automatic on these platforms)**
4. **Rotate API keys regularly**
5. **Set up rate limiting for production**