# DevbrainAI Frontend Setup Guide

## Quick Start (Recommended)

For faster development setup, use the simplified package.json:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Use simplified dependencies (faster install)
cp package.json.simple package.json

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

## Full Feature Setup

For complete functionality with all advanced features:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install all dependencies (takes longer)
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start development server
npm run dev
```

## Environment Variables

Create `.env.local` file:

```env
VITE_API_URL=http://localhost:4000/api
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_WS_ENDPOINT=ws://localhost:4000
VITE_ENABLE_MOCK_DATA=true
```

## Key Features Implemented

### ✅ Core Components
- Button, Input, Avatar, Badge, Spinner (atoms)
- MessageBubble, MessageInput (molecules)  
- ConversationPanel, VisualizationCanvas (organisms)

### ✅ Key Pages
- HomePage (landing page with hero section)
- AuthPage (login/signup with social auth)
- DashboardPage (project overview with stats)
- ConversationPage (AI chat with visual panel)

### ✅ State Management
- Zustand for global state
- React Query for server state
- WebSocket connection state
- Conversation and message management

### ✅ Design System
- TailwindCSS with custom design tokens
- Consistent color palette and typography
- Responsive design patterns
- Accessibility features

### ✅ Visualization
- D3.js integration for interactive charts
- Market analysis bubble charts
- Real-time visualization updates
- Responsive chart design

### ✅ Testing Setup
- Vitest with React Testing Library
- Component unit tests
- Mock setup for browser APIs
- Coverage reporting

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Run Tests**
   ```bash
   npm run test
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/          # UI components (atoms, molecules, organisms)
├── pages/              # Route components
├── stores/             # Zustand state management
├── types/              # TypeScript definitions
├── utils/              # Helper functions
├── styles/             # Global styles
└── test/               # Test utilities
```

## Mock Data

The app currently uses mock data for development:
- Fake user authentication
- Sample projects and conversations
- Mock AI responses with realistic market data
- Simulated real-time updates

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Features

- Route-based code splitting
- Component lazy loading
- Optimized bundle sizes
- Image optimization ready
- Progressive Web App structure

## Next Steps

1. **Backend Integration**: Connect to real APIs
2. **Authentication**: Implement OAuth providers
3. **WebSocket**: Add real-time message updates  
4. **File Upload**: Implement attachment handling
5. **Voice Input**: Add speech-to-text functionality
6. **Context Export**: Build export functionality
7. **Team Features**: Add collaboration tools
8. **Mobile App**: PWA installation prompts

The frontend is now ready for development and can be extended with additional features as needed!