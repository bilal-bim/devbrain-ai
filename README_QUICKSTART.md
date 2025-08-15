# 🚀 DevbrainAI - Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed and the project is ready to run.

## 🎯 How to Run DevbrainAI

### Option 1: Quick Start (Recommended)
Just double-click or run:
```bash
start-no-docker.bat
```

This will automatically:
- Use SQLite database (no Docker needed)
- Start the backend server on port 3000
- Start the frontend server on port 5173
- Open two terminal windows

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 Access Points

Once running, open your browser to:

- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **GraphQL Playground**: http://localhost:3000/graphql

## 🎮 Using the Application

1. **Open the Frontend**: http://localhost:5173
2. **Click "Get Started"** on the landing page
3. **Start Chatting**: Type your business idea
4. **View Visualizations**: Watch the charts update
5. **Switch AI Models**: Try different perspectives

## ⚠️ Current Status

### ✅ What's Working:
- Frontend UI with all components
- Backend API server
- User interface and navigation
- Visual design system
- API documentation

### 🔧 What Needs Configuration:
- **AI Integration**: Add your Claude API key to `backend/.env`:
  ```
  CLAUDE_API_KEY=sk-ant-xxxxx
  ```
- **Real-time Features**: WebSocket connections need implementation
- **Database**: Currently using SQLite (PostgreSQL optional with Docker)

## 🐛 Troubleshooting

### Frontend won't start?
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Backend errors?
```bash
cd backend
npm install --legacy-peer-deps
npm run start:dev
```

### Port already in use?
Kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use npx
npx kill-port 3000 5173
```

## 📁 Project Structure

```
dev_brain/
├── frontend/          # React + TypeScript UI
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   └── stores/       # State management
│   └── package.json
│
├── backend/           # NestJS API
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   └── main.ts       # Entry point
│   └── package.json
│
├── .env files         # Configuration
├── start-no-docker.bat  # Quick start script
└── This README
```

## 🎯 Next Steps

1. **Add AI Integration**: Get Claude API key from [Anthropic](https://console.anthropic.com/)
2. **Explore the UI**: Try all the features in the frontend
3. **Check API Docs**: Visit http://localhost:3000/api/docs
4. **Customize**: Modify the code to fit your needs

## 💡 Pro Tips

- Frontend has hot reload - changes appear instantly
- Backend also reloads automatically when you save files
- Check console logs in both terminal windows for debugging
- API documentation is interactive - you can test endpoints

## 🔥 Quick Test

After starting both servers:

1. Open http://localhost:5173
2. You should see the DevbrainAI landing page
3. Click "Get Started" 
4. The conversation interface should load
5. Type a message and see the mock AI response

---

**The application is now ready to use!** 🎉

Note: This is a development setup. For production, you'll need proper configuration, security settings, and deployment infrastructure.