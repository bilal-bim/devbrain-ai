// MVI (Minimum Viable Idea) Generator Service
// Transforms business ideas into actionable technical specifications

class MVIGenerator {
  constructor() {
    this.analysisSteps = [
      'ideaCapture',
      'marketAnalysis',
      'userPersonaDiscovery',
      'competitiveIntelligence',
      'featurePrioritization',
      'technicalRecommendation',
      'contextGeneration'
    ];
    
    this.currentProjects = new Map();
  }

  // Start a new MVI generation session
  async startSession(userId, initialIdea) {
    const sessionId = this.generateSessionId();
    const project = {
      id: sessionId,
      userId,
      idea: initialIdea,
      createdAt: new Date(),
      status: 'analyzing',
      currentStep: 'ideaCapture',
      context: {
        businessIdea: initialIdea,
        marketAnalysis: {},
        userPersonas: [],
        competitors: [],
        features: [],
        techStack: {},
        specifications: {},
        visualMaps: {}
      },
      conversationHistory: []
    };
    
    this.currentProjects.set(sessionId, project);
    
    // Start initial analysis
    const analysis = await this.analyzeBusinessIdea(initialIdea);
    project.context.marketAnalysis = analysis.market;
    project.context.visualMaps.marketOpportunity = analysis.visualData;
    
    return {
      sessionId,
      project,
      analysis,
      nextPrompt: this.getNextPrompt('ideaCapture')
    };
  }

  // Analyze business idea and generate market insights
  async analyzeBusinessIdea(idea) {
    // Extract key concepts from the idea
    const concepts = this.extractConcepts(idea);
    
    // Generate market analysis
    const marketAnalysis = {
      market: {
        totalAddressableMarket: this.estimateMarketSize(concepts),
        growthRate: this.estimateGrowthRate(concepts),
        segments: this.identifyMarketSegments(concepts),
        opportunities: this.identifyOpportunities(concepts)
      },
      visualData: {
        type: 'marketBubbleChart',
        data: this.generateMarketVisualization(concepts)
      }
    };
    
    return marketAnalysis;
  }

  // Extract key concepts from business idea
  extractConcepts(idea) {
    const concepts = {
      industry: '',
      targetUser: '',
      mainProblem: '',
      solution: '',
      keywords: []
    };
    
    // Simple keyword extraction (in production, use NLP)
    const lowerIdea = idea.toLowerCase();
    
    // Industry detection
    if (lowerIdea.includes('freelance')) {
      concepts.industry = 'freelance';
      concepts.targetUser = 'freelancers';
    } else if (lowerIdea.includes('ecommerce') || lowerIdea.includes('shop')) {
      concepts.industry = 'ecommerce';
      concepts.targetUser = 'online shoppers';
    } else if (lowerIdea.includes('saas') || lowerIdea.includes('software')) {
      concepts.industry = 'saas';
      concepts.targetUser = 'businesses';
    }
    
    // Problem/solution extraction
    if (lowerIdea.includes('invoice')) {
      concepts.mainProblem = 'invoice management';
      concepts.solution = 'automated invoicing';
    } else if (lowerIdea.includes('payment')) {
      concepts.mainProblem = 'payment processing';
      concepts.solution = 'streamlined payments';
    } else if (lowerIdea.includes('manage')) {
      concepts.mainProblem = 'management complexity';
      concepts.solution = 'simplified management';
    }
    
    concepts.keywords = idea.match(/\b\w+\b/g) || [];
    
    return concepts;
  }

  // Estimate market size based on concepts
  estimateMarketSize(concepts) {
    const marketSizes = {
      'freelance': '$1.2T',
      'ecommerce': '$5.8T',
      'saas': '$195B',
      'default': '$500M'
    };
    
    return marketSizes[concepts.industry] || marketSizes.default;
  }

  // Estimate growth rate
  estimateGrowthRate(concepts) {
    const growthRates = {
      'freelance': '15%',
      'ecommerce': '12%',
      'saas': '18%',
      'default': '10%'
    };
    
    return growthRates[concepts.industry] || growthRates.default;
  }

  // Identify market segments
  identifyMarketSegments(concepts) {
    const segments = {
      'freelance': [
        { name: 'Creative Freelancers', size: '2.3M users', avgIncome: '$45K' },
        { name: 'Tech Freelancers', size: '1.8M users', avgIncome: '$75K' },
        { name: 'Service Freelancers', size: '3.1M users', avgIncome: '$35K' }
      ],
      'ecommerce': [
        { name: 'Small Businesses', size: '30M stores', avgRevenue: '$50K' },
        { name: 'Enterprise', size: '10K stores', avgRevenue: '$10M' },
        { name: 'Dropshippers', size: '2M stores', avgRevenue: '$25K' }
      ],
      'default': [
        { name: 'Small Business', size: '1M users', avgRevenue: '$100K' },
        { name: 'Enterprise', size: '10K users', avgRevenue: '$1M' }
      ]
    };
    
    return segments[concepts.industry] || segments.default;
  }

  // Identify market opportunities
  identifyOpportunities(concepts) {
    return [
      {
        title: 'Mobile-first approach',
        description: '73% of users prefer mobile solutions',
        potential: 'High'
      },
      {
        title: 'AI-powered automation',
        description: 'Reduce manual work by 60%',
        potential: 'Very High'
      },
      {
        title: 'Integration ecosystem',
        description: 'Connect with existing tools',
        potential: 'Medium'
      }
    ];
  }

  // Generate market visualization data
  generateMarketVisualization(concepts) {
    return {
      bubbles: [
        {
          name: 'Core Solution',
          x: 70, // Competition level (0-100)
          y: 85, // Growth rate (0-100)
          size: 45, // Market size
          color: '#4F46E5'
        },
        {
          name: 'Adjacent Market 1',
          x: 45,
          y: 65,
          size: 30,
          color: '#7C3AED'
        },
        {
          name: 'Adjacent Market 2',
          x: 30,
          y: 75,
          size: 25,
          color: '#EC4899'
        }
      ],
      axes: {
        x: { label: 'Competition Level', min: 0, max: 100 },
        y: { label: 'Growth Rate', min: 0, max: 100 }
      }
    };
  }

  // Process user response and move to next step
  async processUserResponse(sessionId, response) {
    const project = this.currentProjects.get(sessionId);
    if (!project) {
      throw new Error('Session not found');
    }
    
    // Add to conversation history
    project.conversationHistory.push({
      role: 'user',
      content: response,
      timestamp: new Date()
    });
    
    // Process based on current step
    let result;
    switch (project.currentStep) {
      case 'ideaCapture':
        result = await this.processIdeaRefinement(project, response);
        project.currentStep = 'userPersonaDiscovery';
        break;
      case 'userPersonaDiscovery':
        result = await this.processUserPersona(project, response);
        project.currentStep = 'competitiveIntelligence';
        break;
      case 'competitiveIntelligence':
        result = await this.processCompetitiveAnalysis(project, response);
        project.currentStep = 'featurePrioritization';
        break;
      case 'featurePrioritization':
        result = await this.processFeaturePriorities(project, response);
        project.currentStep = 'technicalRecommendation';
        break;
      case 'technicalRecommendation':
        result = await this.processTechStackDecision(project, response);
        project.currentStep = 'contextGeneration';
        break;
      case 'contextGeneration':
        result = await this.generateFinalContext(project);
        project.status = 'complete';
        break;
      default:
        result = { message: 'Unknown step' };
    }
    
    // Update project
    this.currentProjects.set(sessionId, project);
    
    return {
      project,
      result,
      nextPrompt: this.getNextPrompt(project.currentStep)
    };
  }

  // Process idea refinement
  async processIdeaRefinement(project, response) {
    // Refine the business idea based on user input
    project.context.businessIdea = {
      original: project.idea,
      refined: response,
      focusArea: this.extractFocusArea(response)
    };
    
    return {
      message: 'Idea refined successfully',
      visualUpdate: this.updateMarketVisualization(project.context.businessIdea)
    };
  }

  // Process user persona selection
  async processUserPersona(project, response) {
    const personas = this.generateUserPersonas(response, project.context.businessIdea);
    project.context.userPersonas = personas;
    
    return {
      message: 'User personas identified',
      personas,
      visualData: this.generatePersonaVisualization(personas)
    };
  }

  // Generate user personas based on target audience
  generateUserPersonas(response, businessIdea) {
    const basePersonas = [
      {
        name: 'Sarah the Designer',
        role: 'Creative Freelancer',
        age: '28-35',
        income: '$45K/year',
        painPoints: [
          'Complex invoicing tools',
          'Slow payment processing',
          'Time tracking hassles'
        ],
        needs: [
          'Simple, visual interfaces',
          'Quick invoice creation',
          'Mobile accessibility'
        ],
        techSavvy: 'Medium'
      },
      {
        name: 'John the Developer',
        role: 'Tech Freelancer',
        age: '25-40',
        income: '$75K/year',
        painPoints: [
          'Manual invoice creation',
          'Client management overhead',
          'Integration limitations'
        ],
        needs: [
          'API integrations',
          'Automation features',
          'Advanced customization'
        ],
        techSavvy: 'High'
      }
    ];
    
    return basePersonas;
  }

  // Process competitive analysis
  async processCompetitiveAnalysis(project, response) {
    const competitors = this.analyzeCompetitors(project.context.businessIdea);
    project.context.competitors = competitors;
    
    return {
      message: 'Competitive landscape mapped',
      competitors,
      visualData: this.generateCompetitiveMatrix(competitors),
      opportunity: this.identifyMarketGap(competitors)
    };
  }

  // Analyze competitors
  analyzeCompetitors(businessIdea) {
    return [
      {
        name: 'QuickBooks',
        marketShare: '45%',
        pricing: '$50-180/month',
        strengths: ['Brand recognition', 'Full accounting'],
        weaknesses: ['Complex for freelancers', 'Expensive'],
        targetMarket: 'SMB+'
      },
      {
        name: 'FreshBooks',
        marketShare: '22%',
        pricing: '$15-50/month',
        strengths: ['Good UX', 'Time tracking'],
        weaknesses: ['Limited mobile', 'Pricing tiers'],
        targetMarket: 'Freelancers'
      },
      {
        name: 'Wave',
        marketShare: '15%',
        pricing: 'Free',
        strengths: ['Free tier', 'Simple'],
        weaknesses: ['Limited features', 'Support'],
        targetMarket: 'Solopreneurs'
      }
    ];
  }

  // Generate competitive matrix visualization
  generateCompetitiveMatrix(competitors) {
    return {
      type: 'positioningMatrix',
      axes: {
        x: { label: 'Simplicity', range: [0, 100] },
        y: { label: 'Price', range: [0, 200] }
      },
      dataPoints: competitors.map(comp => ({
        name: comp.name,
        x: comp.name === 'Wave' ? 80 : comp.name === 'FreshBooks' ? 60 : 30,
        y: comp.pricing === 'Free' ? 0 : parseInt(comp.pricing.split('-')[0].replace('$', '')),
        size: parseFloat(comp.marketShare)
      })),
      opportunityZone: {
        x: [60, 90],
        y: [15, 35],
        label: 'Market Opportunity'
      }
    };
  }

  // Process feature prioritization
  async processFeaturePriorities(project, response) {
    const features = this.generateFeatureList(project.context);
    project.context.features = features;
    
    return {
      message: 'Features prioritized',
      features,
      visualData: this.generateFeatureImpactChart(features),
      mvpScope: this.defineMVPScope(features)
    };
  }

  // Generate prioritized feature list
  generateFeatureList(context) {
    return [
      {
        name: '2-Click Invoice Creation',
        priority: 'P0',
        effort: 'Medium',
        impact: 'Very High',
        category: 'Core',
        timeEstimate: '1 week'
      },
      {
        name: 'Stripe Payment Integration',
        priority: 'P0',
        effort: 'High',
        impact: 'Very High',
        category: 'Core',
        timeEstimate: '2 weeks'
      },
      {
        name: 'Mobile-First Design',
        priority: 'P0',
        effort: 'Medium',
        impact: 'High',
        category: 'UX',
        timeEstimate: '1 week'
      },
      {
        name: 'Client Portal',
        priority: 'P1',
        effort: 'High',
        impact: 'Medium',
        category: 'Enhancement',
        timeEstimate: '2 weeks'
      },
      {
        name: 'Email Automation',
        priority: 'P1',
        effort: 'Low',
        impact: 'High',
        category: 'Automation',
        timeEstimate: '3 days'
      }
    ];
  }

  // Process tech stack decision
  async processTechStackDecision(project, response) {
    const techStack = this.recommendTechStack(project.context);
    project.context.techStack = techStack;
    
    return {
      message: 'Technical architecture defined',
      techStack,
      visualData: this.generateTechStackDiagram(techStack),
      implementation: this.generateImplementationPlan(techStack)
    };
  }

  // Recommend tech stack based on requirements
  recommendTechStack(context) {
    return {
      frontend: {
        framework: 'React',
        ui: 'Tailwind CSS',
        state: 'Zustand',
        routing: 'React Router',
        reason: 'Fast development, great ecosystem'
      },
      backend: {
        runtime: 'Node.js',
        framework: 'Express',
        database: 'PostgreSQL',
        orm: 'Prisma',
        reason: 'JavaScript everywhere, rapid prototyping'
      },
      integrations: {
        payments: 'Stripe',
        email: 'SendGrid',
        storage: 'AWS S3',
        hosting: 'Vercel + Railway'
      },
      tools: {
        development: 'Cursor AI',
        version: 'Git + GitHub',
        ci: 'GitHub Actions',
        monitoring: 'Sentry'
      }
    };
  }

  // Generate final context package
  async generateFinalContext(project) {
    const context = {
      meta: {
        projectId: project.id,
        createdAt: project.createdAt,
        version: '1.0.0',
        format: 'mcp-compliant'
      },
      business: {
        idea: project.context.businessIdea,
        marketAnalysis: project.context.marketAnalysis,
        userPersonas: project.context.userPersonas,
        competitors: project.context.competitors
      },
      technical: {
        features: project.context.features,
        techStack: project.context.techStack,
        specifications: this.generateDetailedSpecs(project.context),
        architecture: this.generateArchitecture(project.context)
      },
      implementation: {
        userStories: this.generateUserStories(project.context),
        acceptanceCriteria: this.generateAcceptanceCriteria(project.context),
        testScenarios: this.generateTestScenarios(project.context),
        timeline: this.generateTimeline(project.context)
      },
      export: {
        cursor: this.generateCursorExport(project.context),
        github: this.generateGitHubTemplate(project.context),
        documentation: this.generateDocumentation(project.context)
      }
    };
    
    project.context.finalPackage = context;
    
    return {
      message: 'MVI Context Generated Successfully',
      context,
      exportOptions: [
        { format: 'cursor', label: 'Export for Cursor AI' },
        { format: 'github', label: 'Initialize GitHub Repo' },
        { format: 'mcp', label: 'Download MCP Package' },
        { format: 'pdf', label: 'Download PDF Report' }
      ]
    };
  }

  // Generate detailed specifications
  generateDetailedSpecs(context) {
    return {
      functional: {
        invoicing: {
          description: 'Quick invoice creation with templates',
          requirements: [
            'Support multiple templates',
            'Auto-save drafts',
            'PDF generation',
            'Email sending'
          ]
        },
        payments: {
          description: 'Integrated payment processing',
          requirements: [
            'Stripe integration',
            'Multiple payment methods',
            'Webhook handling',
            'Payment notifications'
          ]
        }
      },
      nonFunctional: {
        performance: {
          pageLoad: '<2 seconds',
          apiResponse: '<200ms',
          concurrent: '1000 users'
        },
        security: {
          authentication: 'JWT',
          encryption: 'AES-256',
          compliance: 'PCI DSS'
        }
      }
    };
  }

  // Generate user stories
  generateUserStories(context) {
    return context.features.map(feature => ({
      title: `As a user, I want ${feature.name}`,
      description: `So that I can ${this.getFeatureBenefit(feature)}`,
      acceptanceCriteria: this.getFeatureCriteria(feature),
      priority: feature.priority,
      estimate: feature.timeEstimate
    }));
  }

  // Get next prompt based on current step
  getNextPrompt(step) {
    const prompts = {
      'ideaCapture': 'Tell me more about your target users and main problem you\'re solving.',
      'userPersonaDiscovery': 'Which user segment is your primary focus?',
      'competitiveIntelligence': 'What would make your solution better than existing options?',
      'featurePrioritization': 'Which features are must-haves for your MVP?',
      'technicalRecommendation': 'Do you have a preferred technology or platform?',
      'contextGeneration': 'Your MVI is ready! Choose how you\'d like to export it.'
    };
    
    return prompts[step] || 'Continue describing your idea...';
  }

  // Helper methods
  generateSessionId() {
    return `mvi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractFocusArea(response) {
    // Extract main focus from user's response
    return response.substring(0, 100);
  }

  updateMarketVisualization(businessIdea) {
    // Update market viz based on refined idea
    return { updated: true };
  }

  generatePersonaVisualization(personas) {
    return {
      type: 'personaCards',
      data: personas
    };
  }

  identifyMarketGap(competitors) {
    return {
      gap: 'Mobile-first, simple invoicing for creative freelancers',
      opportunity: 'High',
      estimatedUsers: '2.3M'
    };
  }

  generateFeatureImpactChart(features) {
    return {
      type: 'impactEffortMatrix',
      data: features.map(f => ({
        name: f.name,
        impact: f.impact,
        effort: f.effort
      }))
    };
  }

  defineMVPScope(features) {
    return features.filter(f => f.priority === 'P0');
  }

  generateTechStackDiagram(techStack) {
    return {
      type: 'architectureDiagram',
      layers: techStack
    };
  }

  generateImplementationPlan(techStack) {
    return {
      week1: 'Setup and core backend',
      week2: 'Frontend and UI',
      week3: 'Integrations',
      week4: 'Testing and deployment'
    };
  }

  generateArchitecture(context) {
    return {
      type: 'microservices',
      services: ['api', 'web', 'worker'],
      database: 'PostgreSQL',
      cache: 'Redis'
    };
  }

  generateAcceptanceCriteria(context) {
    return context.features.map(f => ({
      feature: f.name,
      criteria: [`${f.name} works as expected`, 'Tests pass', 'Documentation complete']
    }));
  }

  generateTestScenarios(context) {
    return {
      unit: '80% coverage',
      integration: 'API tests',
      e2e: 'User flows'
    };
  }

  generateTimeline(context) {
    return {
      total: '4 weeks',
      milestones: [
        { week: 1, deliverable: 'Core backend' },
        { week: 2, deliverable: 'Frontend UI' },
        { week: 3, deliverable: 'Integrations' },
        { week: 4, deliverable: 'Testing & deployment' }
      ]
    };
  }

  generateCursorExport(context) {
    return {
      format: 'cursor-compatible',
      files: ['README.md', 'specs.md', 'architecture.md'],
      prompts: ['Build invoice creation feature', 'Integrate Stripe payments']
    };
  }

  generateGitHubTemplate(context) {
    return {
      repoName: 'freelancer-invoice-app',
      description: 'Mobile-first invoicing for creative freelancers',
      template: 'node-react'
    };
  }

  generateDocumentation(context) {
    return {
      readme: 'Project overview and setup',
      api: 'API documentation',
      deployment: 'Deployment guide'
    };
  }

  getFeatureBenefit(feature) {
    const benefits = {
      '2-Click Invoice Creation': 'create invoices quickly',
      'Stripe Payment Integration': 'get paid faster',
      'Mobile-First Design': 'work from anywhere'
    };
    return benefits[feature.name] || 'improve my workflow';
  }

  getFeatureCriteria(feature) {
    return [
      `${feature.name} is implemented`,
      'User can access the feature',
      'Feature works on mobile',
      'Tests are passing'
    ];
  }
}

module.exports = MVIGenerator;