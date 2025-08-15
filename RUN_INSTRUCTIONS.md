# 🚀 DevbrainAI - Quick Start Guide

## Prerequisites

Before running DevbrainAI, ensure you have the following installed:

- ✅ **Node.js 18+** and npm
- ✅ **Docker Desktop** (for PostgreSQL and Redis)
- ✅ **Git** (optional, for version control)

## 🎯 Quick Start (One Command)

### Windows (PowerShell)
```powershell
# Run this from the project root directory
.\start.ps1
```

### Windows (Command Prompt)
```cmd
# Run this from the project root directory
start.bat
```

## 📋 Manual Setup (Step by Step)

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install --legacy-peer-deps

# Install frontend dependencies
cd ../frontend
npm install --legacy-peer-deps
cd ..
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d
```

### 3. Configure Environment Variables

The `.env` files have already been created with default values:

**Backend (.env)**:
- Database: PostgreSQL on localhost:5432
- Redis: localhost:6379
- API Port: 3000

**Frontend (.env)**:
- API URL: http://localhost:3000
- WebSocket: ws://localhost:3000

### 4. Start the Servers

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

## 🌐 Access the Application

Once everything is running, you can access:

- 🎨 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3000
- 📚 **API Documentation**: http://localhost:3000/api/docs
- 🗄️ **Database Admin**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: postgres
  - Password: postgres
  - Database: devbrain_db

## 🎮 How to Use

1. **Open the Frontend**: Navigate to http://localhost:5173
2. **Start a Conversation**: Click "Get Started" on the landing page
3. **Chat with AI**: Type your business idea in the chat interface
4. **View Visualizations**: Watch the market analysis charts update in real-time
5. **Export Context**: Click export to get development-ready packages

## ⚠️ Important Notes

### Current Limitations
- **AI Responses**: Currently using mock data (add your Claude API key in backend/.env to enable real AI)
- **WebSocket**: Real-time features are partially implemented
- **Context Export**: Export functionality shows mock data

### To Enable Real AI
1. Get a Claude API key from [Anthropic Console](https://console.anthropic.com/)
2. Add it to `backend/.env`:
   ```
   CLAUDE_API_KEY=your_actual_api_key_here
   ```
3. Restart the backend server

## 🛠️ Troubleshooting

### Docker Not Running
```
Error: Failed to start Docker containers
```
**Solution**: Make sure Docker Desktop is running

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: 
- Kill the process using the port: `npx kill-port 3000`
- Or change the port in `.env` files

### Database Connection Failed
```
Error: Cannot connect to database
```
**Solution**: 
- Ensure Docker containers are running: `docker ps`
- Check database logs: `docker logs devbrain_postgres`

### Module Not Found Errors
```
Error: Cannot find module '@nestjs/core'
```
**Solution**: 
- Delete node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps
  ```

## 🧪 Development Commands

### Backend Commands
```bash
cd backend
npm run start:dev    # Development with hot reload
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Check code quality
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run preview     # Preview production build
npm run lint         # Check code quality
```

### Docker Commands
```bash
docker-compose up -d     # Start services in background
docker-compose down      # Stop all services
docker-compose logs      # View service logs
docker-compose ps        # Check service status
```

## 📊 System Architecture

```
Frontend (React + TypeScript)
    ↓
Backend API (NestJS)
    ↓
├── PostgreSQL (Main Database)
├── Redis (Cache & Sessions)
└── Claude API (AI Service)
```

## 🔒 Security Notes

- Default JWT secret is insecure - change it in production
- Database uses default credentials - change in production
- CORS is configured for localhost only
- Rate limiting is enabled (100 requests/minute)

## 📝 Next Steps

1. **Add Claude API Key** for real AI conversations
2. **Implement WebSocket** features for real-time updates
3. **Complete Context Export** functionality
4. **Add Authentication** for user management
5. **Deploy to Production** using Docker or cloud services

## 💡 Tips

- Use the API documentation at http://localhost:3000/api/docs to explore endpoints
- Check the database admin at http://localhost:8080 to view data
- Frontend has hot reload - changes appear instantly
- Backend also has hot reload in development mode

## 🆘 Need Help?

If you encounter issues:
1. Check the logs in each terminal window
2. Ensure all prerequisites are installed
3. Try the troubleshooting steps above
4. Restart all services using the startup script

---

**Happy Coding! 🚀**