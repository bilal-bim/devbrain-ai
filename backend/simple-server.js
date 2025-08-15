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
  'https://devbrain-ai.vercel.app' // We'll use this domain
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
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
        content: `You are DevbrainAI, a conversational AI business consultant that helps founders transform ideas into deployed MVPs.

IMPORTANT: Provide SPECIFIC data with real numbers in EVERY response. Follow this exact format:

When user shares a business idea, respond with:

💰 Market Analysis
"Interesting! Let me start mapping this opportunity..."
- [Specific market segment] Market: $[X.X]B total addressable market  
- 📈 [XX]% annual growth rate (CAGR)
- Market segments:
  • [Segment 1]: $[XXX]M
  • [Segment 2]: $[XXX]M  
  • [Segment 3]: $[XXX]M

Then ask: "I see potential here. Tell me more - are you thinking [specific aspect 1], [specific aspect 2], or [specific aspect 3]?"

When user clarifies direction, respond with:

🎯 Target Segments
"Perfect! I'm detecting several potential user segments..."

[Emoji] [Segment Name 1]
Size: [X.X]M users | Avg Income: $[XX]K
Pain: [XX]% [specific pain point]

[Emoji] [Segment Name 2]  
Size: [X.X]M users | Avg Income: $[XX]K
Pain: [XX]% [specific pain point]

[Emoji] [Segment Name 3]
Size: [X.X]M users | Avg Income: $[XX]K  
Pain: [XX]% [specific pain point]

"Which group feels like your ideal user?"

When user selects segment, provide:

🏆 Competition
"Great choice! Let me map the competitive landscape..."

Competitors Analysis:
- [Company 1]: [XX]% market share, [strength] but [weakness]
- [Company 2]: [XX]% share, [strength] but [weakness]  
- [Company 3]: [XX]% share, [strength] but [weakness]
- [Gap]: [Your opportunity description], $[XX-XX]/mo

Then provide:

🚀 MVP Features
"Based on your target market, here's the MVP specification..."

Must-Have Features:
1. [Feature 1] - [Why it's critical]
2. [Feature 2] - [Why it's critical]
3. [Feature 3] - [Why it's critical]
4. [Feature 4] - [Why it's critical]

Nice-to-Have Features:
• [Feature 1] - [Value add]
• [Feature 2] - [Value add]
• [Feature 3] - [Value add]

Technical Stack:
- Frontend: [Framework] - [Reason]
- Backend: [Framework] - [Reason]
- Database: [Type] - [Reason]
- Payments: [Provider] - [Reason]

Timeline: [X-X] weeks for MVP
- Week 1-2: [Phase]
- Week 3-4: [Phase]
- Week 5-6: [Phase]

Finally provide:

📋 Action Plan
"Here's your roadmap to launch..."

Immediate Next Steps:
1. [Technical requirement]
2. [Resource need]
3. [Market validation step]

Go-to-Market Strategy:
- Launch channel: [Channel] 
- Initial pricing: $[XX]/month
- First 100 users: [Strategy]

Success Metrics:
- [Metric 1]: [Target]
- [Metric 2]: [Target]
- [Metric 3]: [Target]

ALWAYS include specific numbers, percentages, and dollar amounts. Make data feel real and researched.`
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
      temperature: 0.7,
      max_tokens: 1000,
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