import React, { useState, useEffect } from 'react';
import { Send, Download, Sparkles, TrendingUp, Users, Target, Code, Package, ArrowRight, CheckCircle } from 'lucide-react';
import './styles/globals.css';

// Market Visualization Component
const MarketVisualization = ({ data }) => {
  if (!data || !data.data) return null;
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
        Market Opportunity Analysis
      </h3>
      <div className="relative h-64 bg-white rounded-lg p-4">
        <svg width="100%" height="100%" viewBox="0 0 400 240">
          {/* Axes */}
          <line x1="40" y1="200" x2="360" y2="200" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="40" y1="200" x2="40" y2="20" stroke="#e5e7eb" strokeWidth="2" />
          
          {/* Labels */}
          <text x="200" y="230" textAnchor="middle" className="text-xs fill-gray-600">
            Competition Level →
          </text>
          <text x="15" y="110" textAnchor="middle" className="text-xs fill-gray-600" transform="rotate(-90 15 110)">
            Growth Rate →
          </text>
          
          {/* Bubbles */}
          {data.data.bubbles?.map((bubble, index) => (
            <g key={index}>
              <circle
                cx={40 + (bubble.x / 100) * 320}
                cy={200 - (bubble.y / 100) * 180}
                r={bubble.size}
                fill={bubble.color}
                opacity="0.7"
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
              <text
                x={40 + (bubble.x / 100) * 320}
                y={200 - (bubble.y / 100) * 180}
                textAnchor="middle"
                className="text-xs fill-white font-semibold pointer-events-none"
              >
                {bubble.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {data.market?.totalAddressableMarket || '$1.2T'}
          </div>
          <div className="text-sm text-gray-600">Market Size</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.market?.growthRate || '15%'}
          </div>
          <div className="text-sm text-gray-600">Growth Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.market?.segments?.length || 3}
          </div>
          <div className="text-sm text-gray-600">Segments</div>
        </div>
      </div>
    </div>
  );
};

// User Persona Cards
const PersonaCards = ({ personas }) => {
  if (!personas || personas.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-indigo-600" />
        Target User Personas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((persona, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{persona.name}</h4>
                <p className="text-sm text-gray-600">{persona.role}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">{persona.income}</div>
                <div className="text-xs text-gray-500">Annual Income</div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Pain Points:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {persona.painPoints?.map((pain, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-red-400 mr-1">•</span>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Needs:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {persona.needs?.map((need, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-400 mr-1">•</span>
                      {need}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Feature Priority Matrix
const FeatureMatrix = ({ features }) => {
  if (!features || features.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2 text-indigo-600" />
        MVP Feature Priorities
      </h3>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  feature.priority === 'P0' ? 'bg-red-100 text-red-600' :
                  feature.priority === 'P1' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {feature.priority}
                </span>
                <h4 className="ml-3 font-semibold text-gray-900">{feature.name}</h4>
              </div>
              <div className="text-sm text-gray-600">{feature.timeEstimate}</div>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center">
                <span className="font-semibold mr-1">Effort:</span>
                <span className={`${
                  feature.effort === 'Low' ? 'text-green-600' :
                  feature.effort === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{feature.effort}</span>
              </span>
              <span className="flex items-center">
                <span className="font-semibold mr-1">Impact:</span>
                <span className={`${
                  feature.impact === 'Very High' ? 'text-green-600' :
                  feature.impact === 'High' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>{feature.impact}</span>
              </span>
              <span className="flex items-center">
                <span className="font-semibold mr-1">Category:</span>
                {feature.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tech Stack Visualization
const TechStackView = ({ techStack }) => {
  if (!techStack) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Code className="w-5 h-5 mr-2 text-indigo-600" />
        Recommended Technology Stack
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(techStack).map(([category, details]) => (
          <div key={category} className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 capitalize mb-3">{category}</h4>
            {typeof details === 'object' && (
              <div className="space-y-2">
                {Object.entries(details).map(([key, value]) => (
                  key !== 'reason' && (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  )
                ))}
                {details.reason && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600 italic">{details.reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main DevBrain MVI Component
const DevbrainMVI = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState('initial');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [visualData, setVisualData] = useState({});

  // Start new MVI session
  const handleStart = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/mvi/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: input })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setCurrentStep(data.project.currentStep);
        setProject(data.project);
        setVisualData(data.analysis);
        
        setConversation([
          { role: 'user', content: input },
          { role: 'assistant', content: data.aiResponse || data.nextPrompt }
        ]);
        
        setInput('');
      }
    } catch (error) {
      console.error('Error starting MVI:', error);
    } finally {
      setLoading(false);
    }
  };

  // Continue conversation
  const handleContinue = async () => {
    if (!input.trim() || !sessionId) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/mvi/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, response: input })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentStep(data.project.currentStep);
        setProject(data.project);
        
        // Update visual data based on step
        if (data.result.visualData) {
          setVisualData(prev => ({ ...prev, ...data.result }));
        }
        
        setConversation(prev => [
          ...prev,
          { role: 'user', content: input },
          { role: 'assistant', content: data.aiResponse || data.nextPrompt }
        ]);
        
        setInput('');
      }
    } catch (error) {
      console.error('Error continuing MVI:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export context
  const handleExport = async (format) => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/mvi/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, format })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Handle export (download file, show instructions, etc.)
        console.log('Export successful:', data);
        alert(`Context exported in ${format} format! Check console for details.`);
      }
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sessionId) {
      handleContinue();
    } else {
      handleStart();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            DevbrainAI MVI Generator
          </h1>
          <p className="text-gray-600">Transform your business idea into a deployable MVP</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                AI Business Consultant
              </h2>
              {currentStep && (
                <p className="text-sm text-gray-600 mt-1">
                  Step: <span className="font-medium capitalize">{currentStep.replace(/([A-Z])/g, ' $1').trim()}</span>
                </p>
              )}
            </div>

            {/* Conversation History */}
            <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              {conversation.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-4">
                    Hi! I'm your AI business consultant. I'll help you turn your idea into a validated MVP with real market data and technical guidance.
                  </p>
                  <p className="text-sm text-gray-400">
                    Tell me about your business idea...
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-xs text-gray-400">Examples:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => setInput("An app for freelancers to manage invoices")}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        Freelancer invoicing app
                      </button>
                      <button
                        onClick={() => setInput("Social platform for developers")}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        Developer social network
                      </button>
                      <button
                        onClick={() => setInput("AI-powered email assistant")}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        AI email assistant
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                conversation.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sessionId ? "Continue the conversation..." : "Describe your business idea..."}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Export Options */}
            {project?.status === 'complete' && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Your MVI is Ready!
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport('cursor')}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Export for Cursor
                  </button>
                  <button
                    onClick={() => handleExport('github')}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Create GitHub Repo
                  </button>
                  <button
                    onClick={() => handleExport('mcp')}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download MCP
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visual Intelligence Panel */}
          <div className="space-y-6">
            {/* Market Analysis */}
            {visualData.market && <MarketVisualization data={visualData} />}
            
            {/* User Personas */}
            {project?.context?.userPersonas && <PersonaCards personas={project.context.userPersonas} />}
            
            {/* Features */}
            {project?.context?.features && <FeatureMatrix features={project.context.features} />}
            
            {/* Tech Stack */}
            {project?.context?.techStack && <TechStackView techStack={project.context.techStack} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevbrainMVI;