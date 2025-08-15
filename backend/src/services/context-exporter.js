// Context Exporter Service
// Generates MCP-compliant context packages for various platforms

const fs = require('fs').promises;
const path = require('path');

class ContextExporter {
  constructor() {
    this.exportFormats = ['mcp', 'cursor', 'github', 'replit', 'pdf'];
  }

  // Export context in specified format
  async exportContext(project, format) {
    switch (format) {
      case 'mcp':
        return this.exportMCPFormat(project);
      case 'cursor':
        return this.exportCursorFormat(project);
      case 'github':
        return this.exportGitHubFormat(project);
      case 'replit':
        return this.exportReplitFormat(project);
      case 'pdf':
        return this.exportPDFFormat(project);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Export MCP-compliant context package
  async exportMCPFormat(project) {
    const mcpPackage = {
      version: '1.0.0',
      format: 'mcp',
      project: {
        id: project.id,
        name: this.generateProjectName(project),
        description: project.context.businessIdea.refined || project.idea,
        createdAt: project.createdAt,
        status: project.status
      },
      context: {
        business: {
          idea: project.context.businessIdea,
          market: project.context.marketAnalysis,
          personas: project.context.userPersonas,
          competitors: project.context.competitors
        },
        technical: {
          features: project.context.features,
          architecture: project.context.techStack,
          specifications: project.context.specifications
        },
        implementation: {
          userStories: this.generateUserStories(project.context.features),
          acceptanceCriteria: this.generateAcceptanceCriteria(project.context.features),
          timeline: this.generateTimeline(project.context.features)
        }
      },
      files: this.generateMCPFiles(project)
    };

    return {
      format: 'mcp',
      package: mcpPackage,
      files: await this.createMCPFiles(mcpPackage)
    };
  }

  // Export for Cursor AI IDE
  async exportCursorFormat(project) {
    const cursorPackage = {
      name: this.generateProjectName(project),
      type: 'cursor-project',
      version: '1.0.0',
      description: project.context.businessIdea.refined || project.idea,
      context: {
        systemPrompt: this.generateCursorSystemPrompt(project),
        projectStructure: this.generateProjectStructure(project),
        features: this.generateCursorFeatures(project),
        codeTemplates: this.generateCodeTemplates(project)
      },
      settings: {
        framework: project.context.techStack?.frontend?.framework || 'React',
        language: 'JavaScript',
        aiModel: 'gpt-4',
        testFramework: 'Jest'
      }
    };

    return {
      format: 'cursor',
      package: cursorPackage,
      instructions: this.generateCursorInstructions(project)
    };
  }

  // Export as GitHub repository template
  async exportGitHubFormat(project) {
    const githubTemplate = {
      name: this.generateProjectName(project),
      description: project.context.businessIdea.refined || project.idea,
      private: false,
      auto_init: true,
      gitignore_template: 'Node',
      license_template: 'mit',
      files: {
        'README.md': this.generateREADME(project),
        'package.json': this.generatePackageJSON(project),
        '.env.example': this.generateEnvExample(project),
        'docs/ARCHITECTURE.md': this.generateArchitectureDoc(project),
        'docs/API.md': this.generateAPIDoc(project),
        'docs/FEATURES.md': this.generateFeaturesDoc(project)
      },
      structure: this.generateGitHubStructure(project)
    };

    return {
      format: 'github',
      template: githubTemplate,
      setupCommands: this.generateSetupCommands(project)
    };
  }

  // Generate project name from idea
  generateProjectName(project) {
    const idea = project.context.businessIdea?.refined || project.idea || 'project';
    return idea
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  // Generate user stories from features
  generateUserStories(features) {
    if (!features || !Array.isArray(features)) return [];
    
    return features.map(feature => ({
      id: `US-${features.indexOf(feature) + 1}`,
      title: `As a user, I want ${feature.name}`,
      description: `So that I can ${this.getFeatureBenefit(feature)}`,
      priority: feature.priority,
      estimate: feature.timeEstimate,
      acceptanceCriteria: [
        `${feature.name} is accessible from the main interface`,
        'Feature works as described in specifications',
        'All edge cases are handled gracefully',
        'Feature is tested and documented'
      ]
    }));
  }

  // Generate acceptance criteria
  generateAcceptanceCriteria(features) {
    if (!features || !Array.isArray(features)) return [];
    
    return features.map(feature => ({
      feature: feature.name,
      criteria: [
        {
          id: `AC-${features.indexOf(feature) + 1}-1`,
          description: `${feature.name} meets functional requirements`,
          testable: true
        },
        {
          id: `AC-${features.indexOf(feature) + 1}-2`,
          description: 'Feature is responsive on mobile devices',
          testable: true
        },
        {
          id: `AC-${features.indexOf(feature) + 1}-3`,
          description: 'Feature has >80% test coverage',
          testable: true
        }
      ]
    }));
  }

  // Generate project timeline
  generateTimeline(features) {
    if (!features || !Array.isArray(features)) return { weeks: 4, milestones: [] };
    
    const p0Features = features.filter(f => f.priority === 'P0');
    const p1Features = features.filter(f => f.priority === 'P1');
    
    return {
      totalWeeks: 4,
      milestones: [
        {
          week: 1,
          name: 'Foundation',
          deliverables: ['Project setup', 'Core architecture', 'Database schema']
        },
        {
          week: 2,
          name: 'Core Features',
          deliverables: p0Features.slice(0, 2).map(f => f.name)
        },
        {
          week: 3,
          name: 'Integration & Polish',
          deliverables: p0Features.slice(2).concat(p1Features.slice(0, 1)).map(f => f.name)
        },
        {
          week: 4,
          name: 'Testing & Deployment',
          deliverables: ['Complete testing', 'Documentation', 'Deployment']
        }
      ]
    };
  }

  // Generate MCP files structure
  generateMCPFiles(project) {
    return {
      'manifest.json': {
        version: '1.0.0',
        name: this.generateProjectName(project),
        description: project.context.businessIdea?.refined || project.idea,
        tools: ['cursor', 'claude-cli', 'vscode'],
        exports: ['context', 'specifications', 'tests']
      },
      'context/business.json': project.context.businessIdea,
      'context/market.json': project.context.marketAnalysis,
      'context/personas.json': project.context.userPersonas,
      'context/competitors.json': project.context.competitors,
      'specifications/features.json': project.context.features,
      'specifications/architecture.json': project.context.techStack,
      'specifications/user-stories.json': this.generateUserStories(project.context.features),
      'tests/scenarios.json': this.generateTestScenarios(project.context.features)
    };
  }

  // Create actual MCP files
  async createMCPFiles(mcpPackage) {
    const files = [];
    const baseDir = `exports/${mcpPackage.project.id}`;
    
    // Create directory structure
    for (const [filePath, content] of Object.entries(mcpPackage.files)) {
      const fullPath = path.join(baseDir, filePath);
      files.push({
        path: fullPath,
        content: JSON.stringify(content, null, 2)
      });
    }
    
    return files;
  }

  // Generate Cursor system prompt
  generateCursorSystemPrompt(project) {
    return `You are building ${project.context.businessIdea?.refined || project.idea}.

Key Requirements:
${project.context.features?.map(f => `- ${f.name}: ${f.priority}`).join('\n') || '- Build core features'}

Tech Stack:
- Frontend: ${project.context.techStack?.frontend?.framework || 'React'}
- Backend: ${project.context.techStack?.backend?.framework || 'Node.js'}
- Database: ${project.context.techStack?.backend?.database || 'PostgreSQL'}

Target Users:
${project.context.userPersonas?.map(p => `- ${p.name}: ${p.role}`).join('\n') || '- Target users'}

Always prioritize:
1. User experience and simplicity
2. Mobile-first design
3. Performance and scalability
4. Clean, maintainable code`;
  }

  // Generate project structure
  generateProjectStructure(project) {
    const tech = project.context.techStack;
    
    return {
      frontend: {
        framework: tech?.frontend?.framework || 'React',
        folders: ['src/components', 'src/pages', 'src/services', 'src/styles'],
        dependencies: this.getFrontendDependencies(tech)
      },
      backend: {
        framework: tech?.backend?.framework || 'Express',
        folders: ['src/routes', 'src/models', 'src/services', 'src/middleware'],
        dependencies: this.getBackendDependencies(tech)
      },
      shared: {
        folders: ['docs', 'tests', 'scripts'],
        configs: ['.env.example', '.gitignore', 'README.md']
      }
    };
  }

  // Generate Cursor-specific features
  generateCursorFeatures(project) {
    return project.context.features?.map(feature => ({
      name: feature.name,
      prompt: `Implement ${feature.name} with the following requirements:
- Priority: ${feature.priority}
- Estimated effort: ${feature.effort}
- Time estimate: ${feature.timeEstimate}

Acceptance Criteria:
- Feature is fully functional
- Mobile responsive
- Includes tests
- Documented`,
      files: this.getFeatureFiles(feature)
    })) || [];
  }

  // Generate code templates
  generateCodeTemplates(project) {
    const templates = {};
    
    if (project.context.techStack?.frontend?.framework === 'React') {
      templates['Component.jsx'] = this.getReactComponentTemplate();
      templates['Service.js'] = this.getServiceTemplate();
      templates['Component.test.js'] = this.getTestTemplate();
    }
    
    if (project.context.techStack?.backend?.framework === 'Express') {
      templates['route.js'] = this.getExpressRouteTemplate();
      templates['model.js'] = this.getModelTemplate();
      templates['middleware.js'] = this.getMiddlewareTemplate();
    }
    
    return templates;
  }

  // Generate README
  generateREADME(project) {
    return `# ${this.generateProjectName(project)}

${project.context.businessIdea?.refined || project.idea}

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
\`\`\`

## 📋 Features

${project.context.features?.map(f => `- **${f.name}** (${f.priority})`).join('\n') || '- Core features'}

## 🛠 Tech Stack

- **Frontend**: ${project.context.techStack?.frontend?.framework || 'React'}
- **Backend**: ${project.context.techStack?.backend?.framework || 'Node.js'}
- **Database**: ${project.context.techStack?.backend?.database || 'PostgreSQL'}
- **Payments**: ${project.context.techStack?.integrations?.payments || 'Stripe'}

## 👥 Target Users

${project.context.userPersonas?.map(p => `- **${p.name}**: ${p.role}`).join('\n') || '- Target users'}

## 📊 Market Analysis

- **Total Addressable Market**: ${project.context.marketAnalysis?.market?.totalAddressableMarket || 'TBD'}
- **Growth Rate**: ${project.context.marketAnalysis?.market?.growthRate || 'TBD'}

## 📝 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Features Specification](docs/FEATURES.md)

## 🤝 Contributing

This project was generated by DevbrainAI. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT`;
  }

  // Generate package.json
  generatePackageJSON(project) {
    const tech = project.context.techStack;
    
    return {
      name: this.generateProjectName(project),
      version: '0.1.0',
      description: project.context.businessIdea?.refined || project.idea,
      main: 'src/index.js',
      scripts: {
        'dev': 'nodemon src/index.js',
        'start': 'node src/index.js',
        'test': 'jest',
        'build': 'webpack --mode production'
      },
      dependencies: this.getAllDependencies(tech),
      devDependencies: this.getDevDependencies(tech),
      engines: {
        node: '>=16.0.0'
      }
    };
  }

  // Helper methods for dependencies
  getFrontendDependencies(tech) {
    const deps = {
      'React': ['react', 'react-dom', 'react-router-dom'],
      'Vue': ['vue', 'vue-router', 'vuex'],
      'Angular': ['@angular/core', '@angular/common', '@angular/router']
    };
    
    return deps[tech?.frontend?.framework] || deps['React'];
  }

  getBackendDependencies(tech) {
    const deps = {
      'Express': ['express', 'cors', 'helmet', 'morgan'],
      'Fastify': ['fastify', '@fastify/cors', '@fastify/helmet'],
      'NestJS': ['@nestjs/core', '@nestjs/common', '@nestjs/platform-express']
    };
    
    return deps[tech?.backend?.framework] || deps['Express'];
  }

  getAllDependencies(tech) {
    const frontend = this.getFrontendDependencies(tech);
    const backend = this.getBackendDependencies(tech);
    
    return {
      ...frontend.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}),
      ...backend.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}),
      'dotenv': '^16.0.0',
      'stripe': '^11.0.0',
      'jsonwebtoken': '^9.0.0'
    };
  }

  getDevDependencies(tech) {
    return {
      'nodemon': '^2.0.0',
      'jest': '^29.0.0',
      'eslint': '^8.0.0',
      'prettier': '^2.0.0',
      '@types/node': '^18.0.0'
    };
  }

  // Template generators
  getReactComponentTemplate() {
    return `import React, { useState, useEffect } from 'react';
import './Component.css';

const Component = ({ props }) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Component logic
  }, []);
  
  return (
    <div className="component">
      {/* Component UI */}
    </div>
  );
};

export default Component;`;
  }

  getServiceTemplate() {
    return `class Service {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  }
  
  async fetchData() {
    try {
      const response = await fetch(\`\${this.baseURL}/api/data\`);
      return await response.json();
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}

export default new Service();`;
  }

  getTestTemplate() {
    return `import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  test('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText(/component/i)).toBeInTheDocument();
  });
});`;
  }

  getExpressRouteTemplate() {
    return `const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Route logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`;
  }

  getModelTemplate() {
    return `const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Model = sequelize.define('Model', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Model;`;
  }

  getMiddlewareTemplate() {
    return `const middleware = (req, res, next) => {
  // Middleware logic
  next();
};

module.exports = middleware;`;
  }

  // Utility methods
  getFeatureBenefit(feature) {
    const benefits = {
      '2-Click Invoice Creation': 'create invoices quickly and efficiently',
      'Stripe Payment Integration': 'receive payments securely and instantly',
      'Mobile-First Design': 'work from anywhere on any device'
    };
    
    return benefits[feature.name] || 'improve my workflow';
  }

  getFeatureFiles(feature) {
    return [
      `src/components/${feature.name.replace(/\s+/g, '')}.jsx`,
      `src/services/${feature.name.replace(/\s+/g, 'Service')}.js`,
      `tests/${feature.name.replace(/\s+/g, '')}.test.js`
    ];
  }

  generateTestScenarios(features) {
    if (!features || !Array.isArray(features)) return [];
    
    return features.map(feature => ({
      feature: feature.name,
      scenarios: [
        {
          name: 'Happy path',
          steps: ['User accesses feature', 'Performs main action', 'Sees success result']
        },
        {
          name: 'Error handling',
          steps: ['User triggers error', 'Sees helpful error message', 'Can recover']
        }
      ]
    }));
  }

  generateEnvExample(project) {
    return `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...

# App Config
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key

# Frontend
REACT_APP_API_URL=http://localhost:3000`;
  }

  generateArchitectureDoc(project) {
    return `# Architecture Documentation

## Overview
${project.context.businessIdea?.refined || project.idea}

## Tech Stack
- Frontend: ${project.context.techStack?.frontend?.framework || 'React'}
- Backend: ${project.context.techStack?.backend?.framework || 'Node.js'}
- Database: ${project.context.techStack?.backend?.database || 'PostgreSQL'}

## System Architecture
\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│   (React)   │     │  (Express)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
\`\`\`

## Key Components
${project.context.features?.map(f => `- ${f.name}`).join('\n') || '- Core features'}

## Security Considerations
- JWT authentication
- HTTPS encryption
- Input validation
- SQL injection prevention`;
  }

  generateAPIDoc(project) {
    return `# API Documentation

## Base URL
\`http://localhost:3000/api\`

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
\`Authorization: Bearer <token>\`

## Endpoints

### POST /auth/register
Register a new user

### POST /auth/login
Login user

### GET /api/invoices
Get all invoices for authenticated user

### POST /api/invoices
Create a new invoice

### PUT /api/invoices/:id
Update an invoice

### DELETE /api/invoices/:id
Delete an invoice`;
  }

  generateFeaturesDoc(project) {
    return `# Features Documentation

${project.context.features?.map(f => `
## ${f.name}
- **Priority**: ${f.priority}
- **Effort**: ${f.effort}
- **Impact**: ${f.impact}
- **Time Estimate**: ${f.timeEstimate}

### Description
Implementation of ${f.name} feature for improved user experience.

### Acceptance Criteria
- Feature is fully functional
- Mobile responsive design
- Includes comprehensive tests
- Documentation complete
`).join('\n') || '## Core Features\nTo be defined'}`;
  }

  generateCursorInstructions(project) {
    return `# Cursor AI Setup Instructions

1. **Import Context**
   - Open Cursor AI
   - Use command: \`Cursor: Import DevbrainAI Context\`
   - Select this project folder

2. **Initial Setup**
   \`\`\`bash
   npm install
   cp .env.example .env
   npm run dev
   \`\`\`

3. **Start Building**
   - Use the system prompt for guidance
   - Follow the feature specifications
   - Run tests frequently

4. **AI Commands**
   - "Build ${project.context.features?.[0]?.name || 'invoice feature'}"
   - "Add Stripe integration"
   - "Create responsive UI"
   - "Write tests for all features"`;
  }

  generateSetupCommands(project) {
    return [
      'git clone <repository-url>',
      'cd ' + this.generateProjectName(project),
      'npm install',
      'cp .env.example .env',
      '# Configure your .env file',
      'npm run dev'
    ];
  }

  generateGitHubStructure(project) {
    return {
      'src/': {
        'components/': {},
        'pages/': {},
        'services/': {},
        'utils/': {},
        'styles/': {}
      },
      'public/': {},
      'tests/': {},
      'docs/': {},
      'scripts/': {}
    };
  }

  // Export for Replit
  async exportReplitFormat(project) {
    return {
      format: 'replit',
      '.replit': this.generateReplitConfig(project),
      'replit.nix': this.generateReplitNix(project)
    };
  }

  generateReplitConfig(project) {
    return `run = "npm run dev"
entrypoint = "src/index.js"
hidden = [".config", "package-lock.json"]

[languages]
[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx}"
[languages.javascript.languageServer]
start = "typescript-language-server --stdio"

[nix]
channel = "stable-22_11"

[env]
NODE_ENV = "development"
PATH = "/home/runner/$REPL_SLUG/.config/npm/node_global/bin:/home/runner/$REPL_SLUG/node_modules/.bin"`;
  }

  generateReplitNix(project) {
    return `{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
  ];
}`;
  }

  // Export as PDF
  async exportPDFFormat(project) {
    // In a real implementation, this would use a PDF library
    return {
      format: 'pdf',
      content: this.generatePDFContent(project),
      filename: `${this.generateProjectName(project)}-mvi.pdf`
    };
  }

  generatePDFContent(project) {
    return {
      title: this.generateProjectName(project),
      sections: [
        {
          title: 'Executive Summary',
          content: project.context.businessIdea?.refined || project.idea
        },
        {
          title: 'Market Analysis',
          content: project.context.marketAnalysis
        },
        {
          title: 'User Personas',
          content: project.context.userPersonas
        },
        {
          title: 'Features',
          content: project.context.features
        },
        {
          title: 'Technical Architecture',
          content: project.context.techStack
        },
        {
          title: 'Implementation Timeline',
          content: this.generateTimeline(project.context.features)
        }
      ]
    };
  }
}

module.exports = ContextExporter;