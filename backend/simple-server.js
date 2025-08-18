const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const ProjectContext = require('./project-context');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Initialize project context manager
const contextManager = new ProjectContext();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  'https://devbrain-ai.vercel.app',
  'https://devbrain-ai-bilal-bims-projects.vercel.app',
  'https://devbrain-ai-git-main-bilal-bims-projects.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all Vercel preview deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    provider: 'openai',
    model: 'gpt-4'
  });
});

// Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, context } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    });
  }

  try {
    console.log('Received chat request:', message);
    
    const messages = [
      {
        role: 'system',
        content: `You are DevbrainAI, an AI business consultant that helps entrepreneurs validate and develop their business ideas into MVPs.

Your approach:
- Be conversational and supportive, not prescriptive
- Provide realistic, grounded advice based on actual market conditions
- Avoid making up specific numbers or statistics you're not certain about
- When you don't have exact data, use ranges or qualitative assessments
- Focus on helping users think through their ideas systematically

When analyzing a business idea:
1. Start by understanding the problem they're solving and for whom
2. Discuss the market opportunity realistically (without inventing specific numbers)
3. Identify potential customer segments based on the problem
4. Analyze competition honestly - what exists, what works, what gaps remain
5. Suggest MVP features based on solving the core problem first
6. Recommend appropriate technology choices based on their needs and skills

Important guidelines:
- Don't hallucinate specific market sizes or growth rates
- Don't invent company names or statistics
- Be honest when you need more information
- Ask clarifying questions to better understand their vision
- Provide actionable next steps they can actually take
- Consider their technical expertise and resources

Format your responses to be scannable with:
- Clear sections with headings
- Bullet points for lists
- Specific examples when helpful
- Questions to guide the conversation forward

Remember: Your goal is to help them think critically about their idea and develop a realistic path forward, not to impress with made-up data.`
      }
    ];

    // Add context if provided
    if (context && Array.isArray(context)) {
      messages.push(...context);
    }

    // Add the user's message
    messages.push({
      role: 'user',
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: messages,
      temperature: 0.8,
      max_tokens: 2000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const response = {
      success: true,
      data: {
        content: completion.choices[0].message.content,
        provider: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        usage: completion.usage
      }
    };

    console.log('Sending response');
    res.json(response);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.json({
      success: false,
      error: error.message || 'Failed to generate response'
    });
  }
});

// List providers
app.get('/api/ai/providers', (req, res) => {
  res.json({
    available: ['openai'],
    current: 'openai'
  });
});

// Export context endpoint
app.post('/api/context/export', (req, res) => {
  const { projectId, messages } = req.body;
  
  try {
    // Create or get project
    let project = projectId ? contextManager.getProject(projectId) : null;
    
    if (!project && messages && messages.length > 0) {
      // Create project from conversation history
      const firstUserMessage = messages.find(m => m.role === 'user');
      project = contextManager.createProject('default-user', firstUserMessage?.content || 'New Project');
      
      // Extract data from messages
      messages.forEach(msg => {
        if (msg.role === 'assistant' && msg.content) {
          contextManager.extractMarketData(project.id, msg.content);
        }
      });
    }
    
    if (!project) {
      return res.status(404).json({ error: 'No project data to export' });
    }
    
    // Export in MCP format
    const mcpExport = contextManager.exportMCP(project.id);
    
    res.json({
      success: true,
      export: mcpExport,
      downloadUrl: `/api/context/download/${project.id}`
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export context' });
  }
});

// Download context as file
app.get('/api/context/download/:projectId', (req, res) => {
  const { projectId } = req.params;
  const project = contextManager.getProject(projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const mcpExport = contextManager.exportMCP(projectId);
  const jsonContent = JSON.stringify(mcpExport, null, 2);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="devbrain-context-${projectId}.json"`);
  res.send(jsonContent);
});

app.listen(port, () => {
  console.log(`🚀 Simple AI server running on port ${port}`);
  console.log(`📝 API endpoint: http://localhost:${port}/api/ai/chat`);
  console.log(`✅ CORS enabled for: http://localhost:5174`);
  console.log(`🤖 Using OpenAI model: ${process.env.OPENAI_MODEL || 'gpt-4'}`);
});