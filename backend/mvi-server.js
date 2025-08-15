const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

// Import our MVI services
const MVIGenerator = require('./src/services/mvi-generator');
const ContextExporter = require('./src/services/context-exporter');

const app = express();
const port = 3002;

// Initialize services
const mviGenerator = new MVIGenerator();
const contextExporter = new ContextExporter();

// Store active sessions (in production, use Redis or database)
const activeSessions = new Map();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Initialize OpenAI for enhanced responses
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'DevbrainAI MVI Generator',
    version: '2.0.0',
    features: [
      'Business idea analysis',
      'Market intelligence',
      'User persona generation',
      'Competitive analysis',
      'Feature prioritization',
      'Tech stack recommendation',
      'MCP context export'
    ]
  });
});

// Start new MVI generation session
app.post('/api/mvi/start', async (req, res) => {
  try {
    const { userId, idea } = req.body;
    
    if (!idea) {
      return res.status(400).json({
        success: false,
        error: 'Business idea is required'
      });
    }
    
    console.log('Starting MVI generation for:', idea);
    
    // Start MVI generation
    const result = await mviGenerator.startSession(userId || 'anonymous', idea);
    
    // Store session
    activeSessions.set(result.sessionId, result.project);
    
    // Enhance response with AI if available
    let aiEnhancement = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are DevbrainAI, an expert business consultant. Provide encouraging, insightful responses about business ideas.'
            },
            {
              role: 'user',
              content: `Analyze this business idea and provide an encouraging opening response: "${idea}"`
            }
          ],
          max_tokens: 200
        });
        
        aiEnhancement = completion.choices[0].message.content;
      } catch (aiError) {
        console.error('AI enhancement failed:', aiError);
      }
    }
    
    res.json({
      success: true,
      sessionId: result.sessionId,
      analysis: result.analysis,
      nextPrompt: result.nextPrompt,
      aiResponse: aiEnhancement || "Great idea! Let me analyze the market opportunity for you...",
      project: {
        id: result.project.id,
        status: result.project.status,
        currentStep: result.project.currentStep
      }
    });
  } catch (error) {
    console.error('MVI start error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Continue MVI conversation
app.post('/api/mvi/continue', async (req, res) => {
  try {
    const { sessionId, response } = req.body;
    
    if (!sessionId || !response) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and response are required'
      });
    }
    
    // Check if session exists
    if (!activeSessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    console.log(`Continuing session ${sessionId} with response:`, response);
    
    // Process user response
    const result = await mviGenerator.processUserResponse(sessionId, response);
    
    // Update stored session
    activeSessions.set(sessionId, result.project);
    
    // Enhance with AI if available
    let aiEnhancement = null;
    if (process.env.OPENAI_API_KEY && result.project.currentStep !== 'complete') {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are DevbrainAI. Current step: ${result.project.currentStep}. Provide helpful guidance.`
            },
            {
              role: 'user',
              content: `User said: "${response}". Context: ${JSON.stringify(result.result)}`
            }
          ],
          max_tokens: 200
        });
        
        aiEnhancement = completion.choices[0].message.content;
      } catch (aiError) {
        console.error('AI enhancement failed:', aiError);
      }
    }
    
    res.json({
      success: true,
      sessionId,
      result: result.result,
      nextPrompt: result.nextPrompt,
      aiResponse: aiEnhancement,
      project: {
        id: result.project.id,
        status: result.project.status,
        currentStep: result.project.currentStep,
        context: result.project.context
      }
    });
  } catch (error) {
    console.error('MVI continue error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export context in various formats
app.post('/api/mvi/export', async (req, res) => {
  try {
    const { sessionId, format } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    // Get project from session
    const project = activeSessions.get(sessionId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Export in requested format
    const exportResult = await contextExporter.exportContext(
      project, 
      format || 'mcp'
    );
    
    res.json({
      success: true,
      format: exportResult.format,
      data: exportResult,
      downloadUrl: `/api/mvi/download/${sessionId}/${format}`
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get session status
app.get('/api/mvi/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const project = activeSessions.get(sessionId);
  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }
  
  res.json({
    success: true,
    project: {
      id: project.id,
      status: project.status,
      currentStep: project.currentStep,
      context: project.context,
      createdAt: project.createdAt
    }
  });
});

// List all features from context library
app.get('/api/library/features', (req, res) => {
  // In production, this would fetch from a database
  const contextLibrary = [
    {
      id: 'stripe-checkout',
      name: 'Stripe Checkout Optimization',
      description: 'Complete payment integration with optimized checkout flow',
      category: 'payments',
      rating: 4.9,
      downloads: 1247,
      setupTime: '2 hours',
      techStack: ['React', 'Node.js', 'Stripe'],
      included: [
        'Optimized checkout forms',
        'Mobile-responsive design',
        'Webhook processing',
        'Error handling',
        'Test suite'
      ]
    },
    {
      id: 'auth-flow',
      name: 'Authentication Flow',
      description: 'Complete user authentication with JWT',
      category: 'auth',
      rating: 4.8,
      downloads: 892,
      setupTime: '1.5 hours',
      techStack: ['React', 'Node.js', 'JWT'],
      included: [
        'Login/Register forms',
        'JWT token management',
        'Password reset flow',
        'Social auth ready',
        'Security best practices'
      ]
    },
    {
      id: 'email-automation',
      name: 'Email Automation System',
      description: 'Automated email campaigns and transactional emails',
      category: 'communication',
      rating: 4.7,
      downloads: 634,
      setupTime: '3 hours',
      techStack: ['Node.js', 'SendGrid', 'React'],
      included: [
        'Email templates',
        'Campaign automation',
        'Transactional emails',
        'Analytics tracking',
        'Unsubscribe management'
      ]
    }
  ];
  
  res.json({
    success: true,
    library: contextLibrary,
    categories: ['payments', 'auth', 'communication', 'analytics', 'ui']
  });
});

// Get specific context pack details
app.get('/api/library/pack/:packId', (req, res) => {
  const { packId } = req.params;
  
  // Mock data - in production, fetch from database
  const packDetails = {
    id: packId,
    name: 'Stripe Checkout Optimization',
    version: '2.1.0',
    description: 'Production-ready Stripe integration with optimized checkout',
    rating: 4.9,
    reviews: 312,
    downloads: 1247,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    author: 'DevbrainAI Team',
    techRequirements: {
      node: '>=16.0.0',
      npm: '>=7.0.0',
      frameworks: ['React 18+', 'Express 4+']
    },
    features: [
      'One-click checkout',
      'Multiple payment methods',
      'Subscription support',
      'Invoice generation',
      'Refund handling'
    ],
    files: [
      'src/components/CheckoutForm.jsx',
      'src/services/PaymentService.js',
      'backend/routes/payments.js',
      'backend/webhooks/stripe.js',
      'tests/payment.test.js'
    ],
    setupSteps: [
      'Install dependencies',
      'Configure Stripe keys',
      'Run migrations',
      'Test with Stripe CLI',
      'Deploy webhooks'
    ]
  };
  
  res.json({
    success: true,
    pack: packDetails
  });
});

// Add context pack to project
app.post('/api/library/add-to-project', (req, res) => {
  const { sessionId, packId } = req.body;
  
  if (!sessionId || !packId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID and pack ID are required'
    });
  }
  
  // In production, this would actually add the pack to the project
  res.json({
    success: true,
    message: `Pack ${packId} added to project`,
    files: [
      'components/StripeCheckout.jsx',
      'services/stripe.service.js',
      'routes/payments.js'
    ]
  });
});

// Legacy chat endpoint for backward compatibility
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    });
  }
  
  // Redirect to MVI flow
  try {
    const result = await mviGenerator.startSession('chat-user', message);
    
    res.json({
      success: true,
      response: "I'll help you turn that idea into an MVP! Let me analyze the opportunity...",
      sessionId: result.sessionId,
      analysis: result.analysis,
      visualData: result.analysis.visualData,
      nextStep: 'Continue at /api/mvi/continue'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`
🚀 DevbrainAI MVI Generator v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${port}
🔧 API Endpoints:
   POST /api/mvi/start - Start new MVI generation
   POST /api/mvi/continue - Continue conversation
   POST /api/mvi/export - Export context package
   GET  /api/mvi/session/:id - Get session status
   GET  /api/library/features - Browse context library
   
✨ Features:
   • Business idea analysis
   • Market intelligence mapping
   • User persona generation
   • Competitive analysis
   • Feature prioritization
   • Tech stack recommendations
   • MCP-compliant context export
   
🎯 Ready to generate MVPs from ideas!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});