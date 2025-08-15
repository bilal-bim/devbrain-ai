// Project Context Management for DevbrainAI
class ProjectContext {
  constructor() {
    this.projects = new Map();
  }

  createProject(userId, ideaDescription) {
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const project = {
      id: projectId,
      userId,
      createdAt: new Date(),
      idea: ideaDescription,
      stage: 'idea_capture',
      market: {
        tam: null,
        growth: null,
        segments: []
      },
      personas: [],
      competitors: [],
      mvp: {
        features: {
          mustHave: [],
          niceToHave: []
        },
        techStack: null,
        timeline: null
      },
      actionPlan: {
        requirements: [],
        resources: [],
        goToMarket: null,
        metrics: []
      },
      conversations: [],
      visualData: {
        marketMap: null,
        personaMap: null,
        competitiveChart: null,
        featureImpact: null
      }
    };
    
    this.projects.set(projectId, project);
    return project;
  }

  updateProject(projectId, updates) {
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    Object.assign(project, updates);
    project.updatedAt = new Date();
    return project;
  }

  getProject(projectId) {
    return this.projects.get(projectId);
  }

  getUserProjects(userId) {
    return Array.from(this.projects.values())
      .filter(p => p.userId === userId);
  }

  addConversation(projectId, message, response) {
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    project.conversations.push({
      timestamp: new Date(),
      userMessage: message,
      aiResponse: response
    });
    
    return project;
  }

  updateStage(projectId, stage) {
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    project.stage = stage;
    project.stageUpdatedAt = new Date();
    return project;
  }

  // Extract structured data from AI responses
  extractMarketData(projectId, aiResponse) {
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    // Parse market data from response
    const tamMatch = aiResponse.match(/\$?([\d.]+)([BMK])\s*(total addressable market|TAM)/i);
    const growthMatch = aiResponse.match(/([\d.]+)%\s*(annual growth|growth rate|CAGR)/i);
    
    if (tamMatch) {
      const value = parseFloat(tamMatch[1]);
      const unit = tamMatch[2];
      project.market.tam = unit === 'B' ? value * 1000000000 : 
                           unit === 'M' ? value * 1000000 : 
                           value * 1000;
    }
    
    if (growthMatch) {
      project.market.growth = parseFloat(growthMatch[1]);
    }
    
    return project;
  }

  // Export project context in MCP format
  exportMCP(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return null;
    
    return {
      version: '1.0',
      type: 'devbrain_context',
      project: {
        id: project.id,
        created: project.createdAt,
        idea: project.idea,
        stage: project.stage,
        market: project.market,
        personas: project.personas,
        competitors: project.competitors,
        mvp: project.mvp,
        actionPlan: project.actionPlan
      },
      metadata: {
        exportedAt: new Date(),
        conversationCount: project.conversations.length,
        completionPercentage: this.calculateCompletion(project)
      }
    };
  }

  calculateCompletion(project) {
    let score = 0;
    const stages = {
      idea_capture: 20,
      persona_discovery: 20,
      competitive_analysis: 20,
      mvp_definition: 20,
      action_plan: 20
    };
    
    if (project.market.tam) score += 10;
    if (project.market.growth) score += 10;
    if (project.personas.length > 0) score += 20;
    if (project.competitors.length > 0) score += 20;
    if (project.mvp.features.mustHave.length > 0) score += 20;
    if (project.actionPlan.requirements.length > 0) score += 20;
    
    return Math.min(100, score);
  }
}

module.exports = ProjectContext;