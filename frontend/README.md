# DevbrainAI Frontend

Modern React frontend for DevbrainAI - an AI-powered business consultant that transforms ideas into deployed MVPs through intelligent conversation, live visual mapping, and portable context generation.

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query)
- **Routing**: React Router
- **Animation**: Framer Motion
- **Charts**: D3.js with Visx
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives
- **Testing**: Vitest with React Testing Library

## 📋 Prerequisites

- Node.js 18+
- npm 8+

## 🛠️ Installation

1. **Clone and navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── atoms/           # Basic building blocks
│   ├── molecules/       # Component combinations
│   ├── organisms/       # Complex component groups
│   └── templates/       # Page-level layouts
├── pages/               # Route components
├── features/            # Feature-based organization
├── hooks/               # Custom React hooks
├── stores/              # Zustand state management
├── services/            # API and external services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Global styles and tokens
```

## 🎨 Design System

The frontend implements a comprehensive design system based on the UI specifications:

- **Colors**: Primary blue palette with semantic color variants
- **Typography**: Inter font family with consistent type scale
- **Spacing**: 4px base unit with consistent spacing scale
- **Components**: Atomic design methodology with reusable components
- **Responsive**: Mobile-first responsive design
- **Accessibility**: WCAG 2.1 AA compliant

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📱 Key Features

### 1. **Conversational Interface**
- Real-time AI chat with multiple AI perspectives (Claude, Qwen, DeepSeek)
- Message bubbles with rich formatting and actions
- File upload and voice input support
- Typing indicators and optimistic updates

### 2. **Visual Intelligence**
- Interactive D3.js visualizations
- Market analysis bubble charts
- Competitive positioning matrices  
- Real-time chart updates during conversation
- Responsive chart design for mobile

### 3. **State Management**
- Global state with Zustand
- Server state with React Query
- Real-time updates via WebSocket
- Optimistic UI patterns
- Persistence for auth and UI preferences

### 4. **Responsive Design**
- Mobile-first approach
- Touch-optimized interactions
- Collapsible panels and navigation
- Progressive web app capabilities

## 🔗 API Integration

The frontend integrates with multiple backend services:

- **GraphQL API**: Primary API for data operations
- **REST Endpoints**: File uploads and exports
- **WebSocket**: Real-time conversation updates
- **Authentication**: JWT-based auth flow

## 🧩 Component Architecture

### Atomic Design System

**Atoms**: Basic building blocks
- Button, Input, Avatar, Badge, Spinner

**Molecules**: Component combinations  
- MessageBubble, MessageInput, SearchBar

**Organisms**: Complex component groups
- ConversationPanel, VisualizationCanvas, ProjectDashboard

**Templates**: Page-level layouts
- AppLayout, ConversationLayout, DashboardLayout

### Component Standards

- TypeScript interfaces for all props
- Consistent styling with Tailwind classes
- Accessibility features built-in
- Comprehensive unit test coverage
- Storybook documentation (optional)

## 🎯 Performance Optimization

- **Code Splitting**: Route-based and component-based lazy loading
- **Bundle Optimization**: Vendor chunk splitting for better caching
- **Image Optimization**: WebP format with fallbacks
- **Virtual Scrolling**: For large message lists and data tables
- **Memoization**: React.memo and useMemo for expensive operations

## ♿ Accessibility Features

- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Logical tab order and focus indicators
- **Color Contrast**: WCAG AA compliant color ratios
- **Responsive Text**: Scalable fonts and layouts

## 🐛 Error Handling

- **Error Boundaries**: Graceful error recovery
- **User-Friendly Messages**: Clear error communication
- **Retry Mechanisms**: Automatic retry for transient failures
- **Offline Support**: Basic offline functionality
- **Error Reporting**: Integration with error monitoring services

## 🚀 Deployment

The application is configured for deployment to various platforms:

- **Vercel**: Zero-config deployment with preview environments
- **Netlify**: JAMstack deployment with form handling
- **AWS S3/CloudFront**: Static site hosting with CDN
- **Docker**: Containerized deployment for self-hosting

## 📊 Analytics & Monitoring

- **User Analytics**: Track user journeys and feature usage
- **Performance Monitoring**: Core Web Vitals and load times
- **Error Tracking**: Real-time error monitoring and alerts
- **A/B Testing**: Feature flag system for experiments

## 🔧 Development Tools

- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for code quality
- **Lint-staged**: Run linters on staged files
- **TypeScript**: Strict type checking

## 📚 Documentation

- Component documentation in code comments
- TypeScript interfaces for self-documenting APIs
- README files for complex features
- Architecture decision records (ADRs)

## 🤝 Contributing

1. Follow the established code style and patterns
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Ensure accessibility compliance
5. Test across different devices and browsers

## 📄 License

This project is proprietary software. All rights reserved.