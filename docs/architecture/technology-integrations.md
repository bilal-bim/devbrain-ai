# DevbrainAI Technology Integrations Guide

## Overview

DevbrainAI integrates with multiple AI services, development tools, and external platforms to provide a comprehensive development experience. This document details all integration patterns, API specifications, and implementation strategies.

## AI Service Integrations

### Claude (Anthropic) Integration - Primary AI

```typescript
// Claude API client configuration
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
      timeout: 30000, // 30 seconds
      maxRetries: 3,
    });
  }

  async generateResponse(
    prompt: string, 
    context: ConversationContext,
    options: ClaudeOptions = {}
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    const messages = this.formatConversationHistory(context.messages);

    try {
      const response = await this.client.messages.create({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 4000,
        system: systemPrompt,
        messages: [
          ...messages,
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        metadata: {
          user_id: context.userId,
          project_id: context.projectId,
        }
      });

      return {
        content: response.content[0].text,
        model: 'claude',
        tokens: {
          prompt: response.usage.input_tokens,
          completion: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        },
        responseTime: Date.now() - context.startTime,
        metadata: {
          stopReason: response.stop_reason,
          conversationStage: context.stage
        }
      };
    } catch (error) {
      throw new AIServiceError('Claude API error', error);
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `You are DevbrainAI, a conversational AI business consultant that helps founders transform ideas into deployed MVPs. 

Your expertise includes:
- Market analysis and competitive positioning
- Technical architecture and platform selection
- User experience design and journey mapping
- Feature prioritization and MVP scoping
- Context generation for development teams

Current conversation context:
- Project: ${context.project?.name || 'New Project'}
- Industry: ${context.project?.industry || 'Not specified'}
- Stage: ${context.stage}
- User tier: ${context.userTier}

Guidelines:
1. Ask clarifying questions to understand business requirements
2. Provide actionable insights with visual mapping references
3. Generate specific technical recommendations
4. Create MCP-compatible context items during conversation
5. Maintain engaging, founder-friendly communication style

Response format: Provide structured insights that can be visualized in real-time charts and diagrams.`;
  }

  private formatConversationHistory(messages: Message[]): Anthropic.MessageParam[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
  }
}

interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}
```

### Qwen Integration - Alternative Perspective

```typescript
// Qwen API integration for regional/alternative approaches
export class QwenService {
  private baseURL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  
  constructor(private apiKey: string) {}

  async generateResponse(
    prompt: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    const systemPrompt = `You are Qwen, providing alternative perspectives for DevbrainAI. Focus on:
    - Regional market variations and opportunities
    - Alternative technical approaches
    - Different business model considerations
    - Cost-effective solutions for emerging markets
    
    Provide insights that complement Claude's recommendations with:
    - Different technical stacks or platforms
    - Regional market opportunities
    - Alternative monetization strategies
    - Localization considerations`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable'
        },
        body: JSON.stringify({
          model: 'qwen-max',
          input: {
            messages: [
              { role: 'system', content: systemPrompt },
              ...this.formatMessages(context.messages),
              { role: 'user', content: prompt }
            ]
          },
          parameters: {
            temperature: 0.8,
            max_tokens: 3000,
            top_p: 0.9
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Qwen API error: ${data.message}`);
      }

      return {
        content: data.output.text,
        model: 'qwen',
        tokens: {
          prompt: data.usage.input_tokens,
          completion: data.usage.output_tokens,
          total: data.usage.total_tokens
        },
        responseTime: Date.now() - context.startTime,
        metadata: {
          perspective: 'alternative',
          focus: 'regional_opportunities'
        }
      };
    } catch (error) {
      throw new AIServiceError('Qwen API error', error);
    }
  }

  private formatMessages(messages: Message[]) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}
```

### DeepSeek Integration - Innovation Layer

```typescript
// DeepSeek API for emerging trends and advanced features
export class DeepSeekService {
  private baseURL = 'https://api.deepseek.com/v1/chat/completions';
  
  constructor(private apiKey: string) {}

  async generateResponse(
    prompt: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    const systemPrompt = `You are DeepSeek, the innovation layer for DevbrainAI. Focus on:
    - Emerging technology trends and opportunities
    - Advanced features that could differentiate the product
    - Future-proofing strategies
    - Cutting-edge technical approaches
    
    Provide forward-looking insights including:
    - AI/ML integration opportunities
    - Emerging platform capabilities
    - Advanced user experience patterns
    - Next-generation technical architectures`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.formatMessages(context.messages),
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,
          max_tokens: 3500,
          top_p: 0.95
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${data.error?.message}`);
      }

      return {
        content: data.choices[0].message.content,
        model: 'deepseek',
        tokens: {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens
        },
        responseTime: Date.now() - context.startTime,
        metadata: {
          perspective: 'innovation',
          focus: 'emerging_trends'
        }
      };
    } catch (error) {
      throw new AIServiceError('DeepSeek API error', error);
    }
  }

  private formatMessages(messages: Message[]) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}
```

### Multi-AI Orchestration

```typescript
export class AIOrchestrator {
  constructor(
    private claude: ClaudeService,
    private qwen: QwenService,
    private deepseek: DeepSeekService,
    private cache: CacheService
  ) {}

  async generateMultiPerspectiveResponse(
    prompt: string,
    context: ConversationContext,
    requestedModels: AIModel[] = ['claude']
  ): Promise<MultiAIResponse> {
    // Check cache for similar requests
    const cacheKey = this.generateCacheKey(prompt, context, requestedModels);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const responses = await Promise.allSettled([
      // Primary response (always Claude)
      this.claude.generateResponse(prompt, context),
      
      // Alternative perspectives (if requested)
      ...(requestedModels.includes('qwen') ? 
        [this.qwen.generateResponse(prompt, context)] : []),
      ...(requestedModels.includes('deepseek') ? 
        [this.deepseek.generateResponse(prompt, context)] : [])
    ]);

    const result: MultiAIResponse = {
      primary: responses[0].status === 'fulfilled' ? responses[0].value : null,
      alternatives: responses.slice(1)
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<AIResponse>).value),
      totalTokens: 0,
      responseTime: 0,
      perspectives: this.analyzePerspectives(responses)
    };

    // Calculate totals
    const allResponses = [result.primary, ...result.alternatives].filter(Boolean);
    result.totalTokens = allResponses.reduce((sum, r) => sum + r!.tokens.total, 0);
    result.responseTime = Math.max(...allResponses.map(r => r!.responseTime));

    // Cache successful multi-AI responses
    if (result.primary) {
      await this.cache.set(cacheKey, result, CacheTTL.AI_RESPONSE_CACHE);
    }

    return result;
  }

  private analyzePerspectives(responses: PromiseSettledResult<AIResponse>[]): PerspectiveAnalysis {
    const successful = responses
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<AIResponse>).value);

    return {
      consensus: this.findConsensus(successful),
      differences: this.identifyDifferences(successful),
      confidence: this.calculateConfidence(successful),
      recommendations: this.synthesizeRecommendations(successful)
    };
  }

  private findConsensus(responses: AIResponse[]): ConsensusPoints {
    // Natural language processing to identify common themes
    // This would use a more sophisticated approach in production
    const commonThemes = responses.map(r => this.extractThemes(r.content));
    
    return {
      sharedInsights: this.findSharedThemes(commonThemes),
      agreementLevel: this.calculateAgreement(responses),
      conflictingViews: this.identifyConflicts(responses)
    };
  }

  private generateCacheKey(
    prompt: string, 
    context: ConversationContext, 
    models: AIModel[]
  ): string {
    const hash = createHash('sha256');
    hash.update(prompt);
    hash.update(JSON.stringify({
      projectType: context.project?.projectType,
      industry: context.project?.industry,
      stage: context.stage,
      models: models.sort()
    }));
    return `ai_response:${hash.digest('hex')}`;
  }
}
```

## MCP (Model Context Protocol) Integration

### Context Generator

```typescript
export class MCPContextGenerator {
  constructor(
    private projectService: ProjectService,
    private conversationService: ConversationService,
    private aiService: AIOrchestrator
  ) {}

  async generateMCPContext(projectId: string): Promise<MCPContext> {
    const project = await this.projectService.findById(projectId);
    const conversations = await this.conversationService.findByProject(projectId);
    const contextItems = await this.projectService.getContextItems(projectId);

    return {
      manifest: await this.generateManifest(project),
      specifications: await this.generateSpecifications(contextItems),
      architecture: await this.generateArchitecture(project, contextItems),
      progress: await this.generateProgressContext(project),
      tools: await this.generateToolConfigurations(project)
    };
  }

  private async generateManifest(project: Project): Promise<MCPManifest> {
    return {
      version: '1.0.0',
      name: project.name,
      description: project.description,
      type: 'devbrainai-context',
      projectId: project.id,
      created: new Date().toISOString(),
      generator: {
        name: 'DevbrainAI',
        version: process.env.APP_VERSION || '1.0.0'
      },
      metadata: {
        industry: project.industry,
        projectType: project.projectType,
        techStack: project.techStack,
        targetUsers: project.targetUsers,
        estimatedTimeline: project.estimatedTimeline
      },
      compatibility: {
        platforms: ['cursor', 'replit', 'claude-cli', 'vscode'],
        languages: this.extractLanguages(project.techStack),
        frameworks: this.extractFrameworks(project.techStack)
      }
    };
  }

  private async generateSpecifications(contextItems: ContextItem[]): Promise<MCPSpecifications> {
    const specs: MCPSpecifications = {
      features: [],
      userStories: [],
      apiContracts: [],
      testScenarios: [],
      qualityGates: []
    };

    for (const item of contextItems) {
      switch (item.type) {
        case 'feature_spec':
          specs.features.push(this.convertToMCPFeature(item));
          break;
        case 'user_story':
          specs.userStories.push(this.convertToMCPUserStory(item));
          break;
        case 'api_contract':
          specs.apiContracts.push(this.convertToMCPAPI(item));
          break;
        case 'test_scenario':
          specs.testScenarios.push(this.convertToMCPTest(item));
          break;
      }
    }

    return specs;
  }

  private async generateArchitecture(
    project: Project, 
    contextItems: ContextItem[]
  ): Promise<MCPArchitecture> {
    const techSpecs = contextItems.filter(item => item.type === 'tech_spec');
    
    return {
      techStack: {
        frontend: this.extractFrontendStack(project.techStack),
        backend: this.extractBackendStack(project.techStack),
        database: this.extractDatabaseStack(project.techStack),
        infrastructure: this.extractInfrastructureStack(project.techStack)
      },
      systemDesign: {
        components: this.extractComponents(techSpecs),
        integrations: this.extractIntegrations(techSpecs),
        dataFlow: this.generateDataFlow(techSpecs)
      },
      deploymentConfig: {
        environments: ['development', 'staging', 'production'],
        containerization: this.generateContainerConfig(project.techStack),
        cicd: this.generateCICDConfig(project.techStack)
      }
    };
  }

  async exportToFormat(
    context: MCPContext, 
    format: ExportFormat,
    options: ExportOptions = {}
  ): Promise<ExportBundle> {
    const converter = this.getFormatConverter(format);
    return converter.convert(context, options);
  }

  private getFormatConverter(format: ExportFormat): FormatConverter {
    switch (format) {
      case 'cursor':
        return new CursorConverter();
      case 'replit':
        return new ReplitConverter();
      case 'claude_cli':
        return new ClaudeConverter();
      case 'vscode':
        return new VSCodeConverter();
      case 'json':
        return new JSONConverter();
      case 'pdf':
        return new PDFConverter();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}
```

### Platform-Specific Converters

```typescript
// Cursor IDE Integration
export class CursorConverter implements FormatConverter {
  async convert(context: MCPContext, options: ExportOptions): Promise<ExportBundle> {
    const bundle: ExportBundle = {
      format: 'cursor',
      files: new Map(),
      metadata: {
        platform: 'cursor',
        version: '1.0.0',
        created: new Date().toISOString()
      }
    };

    // Generate Cursor-specific configuration
    bundle.files.set('.cursor/settings.json', JSON.stringify({
      "ai.contextFiles": [
        ".cursor/context/**/*.md",
        "docs/**/*.md",
        "README.md"
      ],
      "ai.model": "claude-3-5-sonnet",
      "ai.temperature": 0.7,
      "ai.maxTokens": 4000
    }, null, 2));

    // Generate context directory structure
    bundle.files.set('.cursor/context/project-overview.md', this.generateProjectOverview(context));
    bundle.files.set('.cursor/context/technical-specs.md', this.generateTechnicalSpecs(context));
    bundle.files.set('.cursor/context/user-stories.md', this.generateUserStories(context));
    bundle.files.set('.cursor/context/api-contracts.md', this.generateAPIContracts(context));

    // Generate development templates
    bundle.files.set('docs/DEVELOPMENT.md', this.generateDevelopmentGuide(context));
    bundle.files.set('docs/DEPLOYMENT.md', this.generateDeploymentGuide(context));

    // Generate project initialization scripts
    bundle.files.set('scripts/setup.sh', this.generateSetupScript(context));
    
    return bundle;
  }

  private generateProjectOverview(context: MCPContext): string {
    return `# ${context.manifest.name}

${context.manifest.description}

## Project Details
- **Industry:** ${context.manifest.metadata.industry}
- **Type:** ${context.manifest.metadata.projectType}
- **Timeline:** ${context.manifest.metadata.estimatedTimeline} days
- **Target Users:** ${context.manifest.metadata.targetUsers.join(', ')}

## Tech Stack
\`\`\`json
${JSON.stringify(context.manifest.metadata.techStack, null, 2)}
\`\`\`

## Development Context
This project was generated by DevbrainAI through conversational analysis.
All specifications, user stories, and technical requirements are included
in the context files within this directory.

## Next Steps
1. Review the technical specifications in \`technical-specs.md\`
2. Understand user requirements in \`user-stories.md\`
3. Check API contracts in \`api-contracts.md\`
4. Follow the development guide in \`../docs/DEVELOPMENT.md\`
`;
  }

  private generateTechnicalSpecs(context: MCPContext): string {
    const { architecture } = context;
    
    return `# Technical Specifications

## Architecture Overview

### Frontend Stack
${this.formatStackSection(architecture.techStack.frontend)}

### Backend Stack
${this.formatStackSection(architecture.techStack.backend)}

### Database
${this.formatStackSection(architecture.techStack.database)}

### Infrastructure
${this.formatStackSection(architecture.techStack.infrastructure)}

## System Components
${architecture.systemDesign.components.map(comp => 
  `### ${comp.name}
${comp.description}
- **Type:** ${comp.type}
- **Responsibilities:** ${comp.responsibilities.join(', ')}
- **Dependencies:** ${comp.dependencies.join(', ')}
`).join('\n')}

## Integration Points
${architecture.systemDesign.integrations.map(integration => 
  `### ${integration.name}
- **Type:** ${integration.type}
- **Description:** ${integration.description}
- **Configuration:** 
\`\`\`json
${JSON.stringify(integration.config, null, 2)}
\`\`\`
`).join('\n')}
`;
  }

  private formatStackSection(stack: any): string {
    return Object.entries(stack)
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n');
  }
}

// Replit Integration
export class ReplitConverter implements FormatConverter {
  async convert(context: MCPContext, options: ExportOptions): Promise<ExportBundle> {
    const bundle: ExportBundle = {
      format: 'replit',
      files: new Map(),
      metadata: {
        platform: 'replit',
        version: '1.0.0',
        created: new Date().toISOString()
      }
    };

    // Generate .replit configuration
    bundle.files.set('.replit', this.generateReplitConfig(context));
    
    // Generate replit.nix for dependencies
    bundle.files.set('replit.nix', this.generateNixConfig(context));

    // Generate project structure
    bundle.files.set('README.md', this.generateReplitReadme(context));
    
    // Generate development scripts
    bundle.files.set('package.json', this.generatePackageJson(context));
    
    return bundle;
  }

  private generateReplitConfig(context: MCPContext): string {
    const techStack = context.architecture.techStack;
    
    return `language = "${this.detectPrimaryLanguage(techStack)}"
run = "${this.generateRunCommand(techStack)}"

[nix]
channel = "stable-22_11"

[deployment]
run = ["sh", "-c", "${this.generateDeployCommand(techStack)}"]

[[ports]]
localPort = ${this.getDefaultPort(techStack)}
externalPort = 80

[env]
NODE_ENV = "development"
`;
  }

  private generateNixConfig(context: MCPContext): string {
    const dependencies = this.extractNixDependencies(context.architecture.techStack);
    
    return `{ pkgs }: {
  deps = [
    ${dependencies.map(dep => `pkgs.${dep}`).join('\n    ')}
  ];
}`;
  }

  private extractNixDependencies(techStack: any): string[] {
    const deps = ['nodejs-18_x', 'nodePackages.npm'];
    
    if (techStack.database?.includes('postgres')) deps.push('postgresql');
    if (techStack.database?.includes('redis')) deps.push('redis');
    if (techStack.backend?.includes('python')) deps.push('python39');
    
    return deps;
  }
}

// Claude CLI Integration
export class ClaudeConverter implements FormatConverter {
  async convert(context: MCPContext, options: ExportOptions): Promise<ExportBundle> {
    const bundle: ExportBundle = {
      format: 'claude_cli',
      files: new Map(),
      metadata: {
        platform: 'claude_cli',
        version: '1.0.0',
        created: new Date().toISOString()
      }
    };

    // Generate Claude CLI configuration
    bundle.files.set('.claude_config.json', JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.7,
      max_tokens: 4000,
      context_files: [
        'context/**/*.md',
        'docs/**/*.md',
        'README.md'
      ]
    }, null, 2));

    // Generate context files for Claude CLI
    bundle.files.set('context/project-context.md', this.generateProjectContext(context));
    bundle.files.set('context/development-guidelines.md', this.generateDevelopmentGuidelines(context));
    bundle.files.set('context/api-documentation.md', this.generateAPIDocumentation(context));

    return bundle;
  }

  private generateProjectContext(context: MCPContext): string {
    return `# Project Context for Claude CLI

## Project: ${context.manifest.name}

${context.manifest.description}

## Current Development Phase
This project is generated from DevbrainAI conversational analysis and is ready for implementation.

## Key Requirements
${context.specifications.features.map(feature => 
  `### ${feature.name}
${feature.description}

**Acceptance Criteria:**
${feature.acceptanceCriteria.map(criteria => `- ${criteria}`).join('\n')}

**Priority:** ${feature.priority}
`).join('\n')}

## Technical Context
- **Frontend:** ${context.architecture.techStack.frontend.framework}
- **Backend:** ${context.architecture.techStack.backend.framework}  
- **Database:** ${context.architecture.techStack.database.type}

## Development Guidelines
When implementing features, ensure:
1. Follow the technical specifications exactly
2. Implement proper error handling
3. Include comprehensive tests
4. Maintain consistent code style
5. Update documentation as needed
`;
  }
}
```

## GitHub Integration

### Webhook Processing

```typescript
@Controller('webhooks')
export class GitHubWebhookController {
  constructor(
    private projectService: ProjectService,
    private progressService: ProgressService,
    private aiService: AIOrchestrator
  ) {}

  @Post('github/:projectId')
  async handleGitHubWebhook(
    @Param('projectId') projectId: string,
    @Body() payload: GitHubWebhookPayload,
    @Headers('x-github-event') eventType: string,
    @Headers('x-hub-signature-256') signature: string
  ) {
    // Verify webhook signature
    if (!this.verifySignature(payload, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const project = await this.projectService.findById(projectId);
    if (!project || project.githubRepo !== payload.repository.full_name) {
      throw new NotFoundException('Project not found or repository mismatch');
    }

    switch (eventType) {
      case 'push':
        await this.handlePushEvent(project, payload);
        break;
      case 'pull_request':
        await this.handlePullRequestEvent(project, payload);
        break;
      case 'issues':
        await this.handleIssueEvent(project, payload);
        break;
      case 'release':
        await this.handleReleaseEvent(project, payload);
        break;
    }

    return { received: true };
  }

  private async handlePushEvent(project: Project, payload: GitHubPushPayload) {
    const commits = payload.commits;
    const branch = payload.ref.replace('refs/heads/', '');

    // Analyze commits for progress tracking
    const analysisPrompt = `Analyze these Git commits for project progress:

Repository: ${payload.repository.full_name}
Branch: ${branch}
Commits: ${commits.length}

Commit Details:
${commits.map(commit => `
- ${commit.id.substring(0, 7)}: ${commit.message}
  Files: ${commit.modified.length + commit.added.length + commit.removed.length} changed
  +${commit.added.length} -${commit.removed.length}
`).join('')}

Based on the commit messages and file changes, identify:
1. Which features or user stories were worked on
2. Estimated completion percentage for each feature
3. Any blockers or issues mentioned
4. Code quality indicators (tests, documentation)
5. Overall project velocity assessment

Respond with structured analysis for progress tracking.`;

    const aiAnalysis = await this.aiService.generateMultiPerspectiveResponse(
      analysisPrompt,
      { project, stage: 'development', userId: 'system' } as ConversationContext
    );

    // Create progress events
    const progressEvents = await this.createProgressEventsFromCommits(
      project.id,
      commits,
      aiAnalysis.primary?.content
    );

    await this.progressService.createEvents(progressEvents);

    // Update feature progress based on commit analysis
    await this.updateFeatureProgressFromCommits(project.id, commits, aiAnalysis.primary?.content);

    // Notify team members
    await this.notifyTeamOfProgress(project, progressEvents);
  }

  private async handlePullRequestEvent(project: Project, payload: GitHubPRPayload) {
    const pr = payload.pull_request;
    
    if (payload.action === 'opened') {
      // Analyze PR for feature completion
      const analysisPrompt = `Analyze this pull request for feature progress:

Title: ${pr.title}
Description: ${pr.body}
Changes: +${pr.additions} -${pr.deletions} lines in ${pr.changed_files} files

Based on this PR, determine:
1. Which features are being implemented or completed
2. Code quality assessment
3. Potential integration issues
4. Testing coverage implications
5. Documentation updates needed`;

      const aiAnalysis = await this.aiService.generateMultiPerspectiveResponse(
        analysisPrompt,
        { project, stage: 'development', userId: 'system' } as ConversationContext
      );

      await this.progressService.createEvent({
        projectId: project.id,
        eventType: 'pull_request_opened',
        title: `PR opened: ${pr.title}`,
        description: aiAnalysis.primary?.content,
        eventData: {
          prNumber: pr.number,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files
        },
        source: 'github',
        sourceId: pr.id.toString()
      });
    }

    if (payload.action === 'closed' && pr.merged) {
      // Feature potentially completed
      await this.progressService.createEvent({
        projectId: project.id,
        eventType: 'feature_completed',
        title: `Feature merged: ${pr.title}`,
        eventData: {
          prNumber: pr.number,
          mergedAt: pr.merged_at
        },
        source: 'github',
        sourceId: pr.id.toString(),
        impactScore: this.calculatePRImpactScore(pr)
      });
    }
  }

  private async createProgressEventsFromCommits(
    projectId: string,
    commits: GitHubCommit[],
    aiAnalysis?: string
  ): Promise<CreateProgressEventInput[]> {
    return commits.map(commit => ({
      projectId,
      eventType: 'commit',
      title: commit.message.split('\n')[0],
      description: commit.message,
      eventData: {
        commitId: commit.id,
        author: commit.author.username,
        filesChanged: commit.modified.length + commit.added.length + commit.removed.length,
        additions: commit.added.length,
        deletions: commit.removed.length,
        url: commit.url
      },
      source: 'github' as ProgressEventSource,
      sourceId: commit.id,
      impactScore: this.calculateCommitImpactScore(commit)
    }));
  }

  private calculateCommitImpactScore(commit: GitHubCommit): number {
    const filesChanged = commit.modified.length + commit.added.length + commit.removed.length;
    const linesChanged = commit.added.length + commit.removed.length;
    
    // Base score on file and line changes
    let score = Math.min(filesChanged * 5, 50) + Math.min(linesChanged * 0.1, 25);
    
    // Bonus for test files
    if (commit.added.some(file => file.includes('test') || file.includes('spec'))) {
      score += 15;
    }
    
    // Bonus for documentation
    if (commit.added.some(file => file.includes('.md') || file.includes('docs'))) {
      score += 10;
    }
    
    return Math.min(Math.round(score), 100);
  }

  private verifySignature(payload: any, signature: string): boolean {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return `sha256=${hash}` === signature;
  }
}
```

### GitHub API Client

```typescript
export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: 'DevbrainAI/1.0.0'
    });
  }

  async analyzeRepository(repoUrl: string): Promise<RepositoryAnalysis> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);
    
    const [repoData, languages, commits, branches] = await Promise.all([
      this.octokit.rest.repos.get({ owner, repo }),
      this.octokit.rest.repos.listLanguages({ owner, repo }),
      this.octokit.rest.repos.listCommits({ owner, repo, per_page: 100 }),
      this.octokit.rest.repos.listBranches({ owner, repo })
    ]);

    return {
      name: repoData.data.name,
      description: repoData.data.description,
      languages: Object.keys(languages.data),
      primaryLanguage: repoData.data.language,
      fileCount: await this.getFileCount(owner, repo),
      commitCount: commits.data.length,
      branchCount: branches.data.length,
      lastActivity: repoData.data.updated_at,
      techStack: await this.analyzeTechStack(owner, repo),
      projectStructure: await this.analyzeProjectStructure(owner, repo)
    };
  }

  async setupWebhook(repoUrl: string, projectId: string): Promise<WebhookConfig> {
    const { owner, repo } = this.parseRepoUrl(repoUrl);
    
    const webhookUrl = `${process.env.API_BASE_URL}/api/webhooks/github/${projectId}`;
    
    const webhook = await this.octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret: process.env.GITHUB_WEBHOOK_SECRET
      },
      events: ['push', 'pull_request', 'issues', 'release']
    });

    return {
      id: webhook.data.id,
      url: webhookUrl,
      events: webhook.data.events,
      active: webhook.data.active
    };
  }

  private async analyzeTechStack(owner: string, repo: string): Promise<TechStack> {
    try {
      const packageJson = await this.getFileContent(owner, repo, 'package.json');
      if (packageJson) {
        const pkg = JSON.parse(packageJson);
        return this.parseTechStackFromPackageJson(pkg);
      }

      const requirements = await this.getFileContent(owner, repo, 'requirements.txt');
      if (requirements) {
        return this.parseTechStackFromRequirements(requirements);
      }

      const gemfile = await this.getFileContent(owner, repo, 'Gemfile');
      if (gemfile) {
        return this.parseTechStackFromGemfile(gemfile);
      }

      return { framework: 'unknown', language: 'unknown' };
    } catch (error) {
      return { framework: 'unknown', language: 'unknown' };
    }
  }

  private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const response = await this.octokit.rest.repos.getContent({ owner, repo, path });
      if ('content' in response.data) {
        return Buffer.from(response.data.content, 'base64').toString();
      }
      return null;
    } catch {
      return null;
    }
  }
}
```

## n8n Content Automation Pipeline

### Workflow Configuration

```json
{
  "name": "DevbrainAI Content Pipeline",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "value": 6
            }
          ]
        }
      },
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [200, 300]
    },
    {
      "parameters": {
        "url": "https://www.googleapis.com/youtube/v3/search",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "googleApi",
        "qs": {
          "part": "snippet",
          "q": "web development tutorial 2024",
          "type": "video",
          "order": "viewCount",
          "publishedAfter": "{{ $now.minus({days: 1}).toISO() }}",
          "maxResults": 10
        }
      },
      "name": "YouTube API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [400, 200]
    },
    {
      "parameters": {
        "url": "https://api.github.com/search/repositories",
        "qs": {
          "q": "stars:>1000 pushed:>{{ $now.minus({days: 1}).toISODate() }} language:typescript",
          "sort": "stars",
          "order": "desc",
          "per_page": 20
        }
      },
      "name": "GitHub Trending",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [400, 300]
    },
    {
      "parameters": {
        "url": "https://api.producthunt.com/v2/graphql",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $credentials.productHuntApi.accessToken }}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "query",
              "value": "{ posts(first: 10) { edges { node { name description url votesCount commentsCount createdAt } } } }"
            }
          ]
        }
      },
      "name": "Product Hunt API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [400, 400]
    },
    {
      "parameters": {
        "jsCode": "const items = $input.all();\nconst processedContent = [];\n\nfor (const item of items) {\n  if (item.json.items) {\n    // YouTube content\n    for (const video of item.json.items) {\n      processedContent.push({\n        source: 'youtube',\n        title: video.snippet.title,\n        description: video.snippet.description,\n        url: `https://youtube.com/watch?v=${video.id.videoId}`,\n        publishedAt: video.snippet.publishedAt,\n        channel: video.snippet.channelTitle,\n        type: 'video'\n      });\n    }\n  } else if (item.json.data && item.json.data.posts) {\n    // Product Hunt content\n    for (const post of item.json.data.posts.edges) {\n      processedContent.push({\n        source: 'producthunt',\n        title: post.node.name,\n        description: post.node.description,\n        url: post.node.url,\n        publishedAt: post.node.createdAt,\n        votes: post.node.votesCount,\n        comments: post.node.commentsCount,\n        type: 'product'\n      });\n    }\n  } else if (item.json.items) {\n    // GitHub content\n    for (const repo of item.json.items) {\n      processedContent.push({\n        source: 'github',\n        title: repo.name,\n        description: repo.description,\n        url: repo.html_url,\n        publishedAt: repo.created_at,\n        stars: repo.stargazers_count,\n        language: repo.language,\n        type: 'repository'\n      });\n    }\n  }\n}\n\nreturn processedContent.map(item => ({ json: item }));"
      },
      "name": "Process Content",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [600, 300]
    },
    {
      "parameters": {
        "url": "{{ $env.CLAUDE_API_URL }}/v1/messages",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $env.CLAUDE_API_KEY }}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            },
            {
              "name": "anthropic-version",
              "value": "2023-06-01"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "model",
              "value": "claude-3-sonnet-20240229"
            },
            {
              "name": "max_tokens",
              "value": "4000"
            },
            {
              "name": "messages",
              "value": "[{\"role\": \"user\", \"content\": \"Analyze this trending content and extract reusable development patterns for a context pack library:\\n\\nTitle: {{ $json.title }}\\nDescription: {{ $json.description }}\\nSource: {{ $json.source }}\\nType: {{ $json.type }}\\n\\nIdentify:\\n1. Reusable code patterns or components\\n2. Best practices or architectural insights\\n3. Common implementation approaches\\n4. Potential context pack categories\\n5. Technical requirements and dependencies\\n\\nGenerate a structured analysis for context pack creation.\"}]"
            }
          ]
        }
      },
      "name": "AI Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [800, 300]
    },
    {
      "parameters": {
        "jsCode": "const aiResponse = $json.content[0].text;\nconst originalContent = $('Process Content').item.json;\n\n// Parse AI analysis to extract context pack information\nconst contextPack = {\n  title: `${originalContent.title} - Context Pack`,\n  description: originalContent.description,\n  category: 'trending',\n  source: originalContent.source,\n  sourceUrl: originalContent.url,\n  aiAnalysis: aiResponse,\n  publishedAt: originalContent.publishedAt,\n  qualityScore: Math.random() * 2 + 3, // 3-5 range\n  tags: [\n    originalContent.source,\n    originalContent.type,\n    'trending',\n    new Date().getFullYear().toString()\n  ],\n  content: {\n    analysis: aiResponse,\n    sourceMetadata: originalContent,\n    extractedPatterns: [],\n    codeExamples: [],\n    bestPractices: []\n  }\n};\n\nreturn { json: contextPack };"
      },
      "name": "Create Context Pack",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1000, 300]
    },
    {
      "parameters": {
        "url": "{{ $env.API_BASE_URL }}/api/admin/context-packs",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $env.ADMIN_API_TOKEN }}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "title",
              "value": "={{ $json.title }}"
            },
            {
              "name": "description",
              "value": "={{ $json.description }}"
            },
            {
              "name": "category",
              "value": "={{ $json.category }}"
            },
            {
              "name": "tags",
              "value": "={{ $json.tags }}"
            },
            {
              "name": "content",
              "value": "={{ $json.content }}"
            },
            {
              "name": "qualityScore",
              "value": "={{ $json.qualityScore }}"
            },
            {
              "name": "createdBy",
              "value": "n8n-automation"
            },
            {
              "name": "verified",
              "value": "false"
            }
          ]
        }
      },
      "name": "Save Context Pack",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1200, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "leftValue": "={{ $json.qualityScore }}",
              "rightValue": 4,
              "operator": {
                "type": "number",
                "operation": "gt"
              }
            }
          ],
          "combinator": "and"
        }
      },
      "name": "Quality Filter",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [1000, 150]
    },
    {
      "parameters": {
        "url": "{{ $env.SLACK_WEBHOOK_URL }}",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "text",
              "value": "🎉 New high-quality context pack generated: {{ $json.title }}"
            },
            {
              "name": "channel",
              "value": "#content-pipeline"
            }
          ]
        }
      },
      "name": "Notify Team",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1200, 150]
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "YouTube API",
            "type": "main",
            "index": 0
          },
          {
            "node": "GitHub Trending",
            "type": "main",
            "index": 0
          },
          {
            "node": "Product Hunt API",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "YouTube API": {
      "main": [
        [
          {
            "node": "Process Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "GitHub Trending": {
      "main": [
        [
          {
            "node": "Process Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Product Hunt API": {
      "main": [
        [
          {
            "node": "Process Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Content": {
      "main": [
        [
          {
            "node": "AI Analysis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Analysis": {
      "main": [
        [
          {
            "node": "Create Context Pack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Context Pack": {
      "main": [
        [
          {
            "node": "Quality Filter",
            "type": "main",
            "index": 0
          },
          {
            "node": "Save Context Pack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Quality Filter": {
      "main": [
        [
          {
            "node": "Notify Team",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

This comprehensive technology integration guide provides DevbrainAI with all the necessary integration patterns, API specifications, and implementation details for seamless connection with AI services, development platforms, and external tools. The architecture supports scalable, maintainable integrations that enhance the core conversational AI experience.