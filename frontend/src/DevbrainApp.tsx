import React, { useState, useEffect } from 'react';
import { VisualIntelligence } from './components/VisualIntelligence';
import './styles/globals.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProjectState {
  stage: 'initial' | 'idea_capture' | 'persona_discovery' | 'competitive_analysis' | 'mvp_definition' | 'action_plan';
  marketData?: any;
  personas?: any[];
  competitors?: any[];
  selectedPersona?: string;
}

function DevbrainApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'initial'
  });

  // Parse AI responses to extract structured data
  const parseAIResponse = (response: string) => {
    const newState: Partial<ProjectState> = {};
    
    // Detect stage transitions
    if (response.includes('💰 Market Analysis')) {
      newState.stage = 'idea_capture';
      
      // Extract TAM - more flexible pattern
      const tamMatch = response.match(/\$?([\d.]+)\s*([BMK])\s*(?:total addressable market|TAM|market)/i);
      if (tamMatch) {
        const value = parseFloat(tamMatch[1]);
        const unit = tamMatch[2].toUpperCase();
        const tam = unit === 'B' ? value * 1000000000 : 
                    unit === 'M' ? value * 1000000 : 
                    value * 1000;
        newState.marketData = { ...projectState.marketData, tam };
      }
      
      // Extract growth rate
      const growthMatch = response.match(/([\d.]+)%\s*(?:annual growth|growth rate|CAGR)/i);
      if (growthMatch) {
        const growth = parseFloat(growthMatch[1]);
        newState.marketData = { ...newState.marketData, growth };
      }
      
      // Extract market segments
      const segments = [];
      const segmentRegex = /•\s*([^:]+):\s*\$?([\d.]+)([MBK])/g;
      let match;
      while ((match = segmentRegex.exec(response)) !== null) {
        const value = parseFloat(match[2]);
        const unit = match[3].toUpperCase();
        const segmentValue = unit === 'B' ? value * 1000000000 : 
                            unit === 'M' ? value * 1000000 : 
                            value * 1000;
        segments.push({
          name: match[1].trim(),
          value: segmentValue
        });
      }
      if (segments.length > 0) {
        newState.marketData = { ...newState.marketData, segments };
      }
    }
    
    if (response.includes('🎯 Target Users') || response.includes('Target Segments')) {
      newState.stage = 'persona_discovery';
      
      // Extract personas
      const personaRegex = /([A-Z][^:]+):\s*Size:\s*([^|]+)\s*\|\s*Avg Income:\s*([^P]+)Pain:\s*([\d.]+)%\s*([^\\n]+)/g;
      const personas = [];
      let match;
      while ((match = personaRegex.exec(response)) !== null) {
        personas.push({
          name: match[1].trim(),
          size: match[2].trim(),
          avgIncome: match[3].trim(),
          percentage: parseFloat(match[4]),
          painPoint: match[5].trim()
        });
      }
      if (personas.length > 0) {
        newState.personas = personas;
      }
    }
    
    if (response.includes('🏆 Competition')) {
      newState.stage = 'competitive_analysis';
      
      // Extract competitors (simplified parsing)
      const competitors = [];
      const lines = response.split('\\n');
      lines.forEach(line => {
        const compMatch = line.match(/^-?\s*([A-Za-z]+):\s*([\d.]+)%\s*market share/i);
        if (compMatch) {
          competitors.push({
            name: compMatch[1],
            marketShare: parseFloat(compMatch[2]),
            strengths: ['Good UX'],
            weaknesses: ['Complex'],
            pricing: '$30-50/mo'
          });
        }
      });
      if (competitors.length > 0) {
        newState.competitors = competitors;
      }
    }
    
    if (response.includes('🚀 MVP Features')) {
      newState.stage = 'mvp_definition';
    }
    
    if (response.includes('📋 Action Plan')) {
      newState.stage = 'action_plan';
    }
    
    return newState;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3002/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          context: messages
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.data.content
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Update project state based on response
        const stateUpdates = parseAIResponse(data.data.content);
        setProjectState(prev => ({ ...prev, ...stateUpdates }));
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${data.error}`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to connect to AI service. Please check the backend is running.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
  };

  const handleExportContext = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/context/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Download the context file
        const exportData = JSON.stringify(data.export, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devbrain-context-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Context exported successfully! This can be imported into development tools like Cursor, Replit, or Claude CLI.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export context');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💡 DevbrainAI</h1>
            <p className="text-sm text-gray-500">Transform Ideas into Deployed MVPs</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">Stage: </span>
              <span className="font-medium text-blue-600">
                {projectState.stage.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <button 
              onClick={handleExportContext}
              disabled={messages.length === 0}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export conversation context for use in development tools"
            >
              📦 Export Context
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto text-center py-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Hi! I'm your AI business consultant 👋
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  I'll help you turn your idea into a validated MVP with real market data and technical guidance.
                </p>
                <p className="text-gray-500 mb-8">
                  Tell me about your business idea...
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleQuickAction("I want to build an app for freelancers to manage invoices")}
                    className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 text-left transition"
                  >
                    <div className="text-lg mb-1">📱 Freelancer App</div>
                    <div className="text-sm text-gray-500">Invoice & project management</div>
                  </button>
                  <button
                    onClick={() => handleQuickAction("I need a marketplace for local services")}
                    className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 text-left transition"
                  >
                    <div className="text-lg mb-1">🛍️ Service Marketplace</div>
                    <div className="text-sm text-gray-500">Connect buyers & sellers</div>
                  </button>
                  <button
                    onClick={() => handleQuickAction("I want to create a SaaS platform for small businesses")}
                    className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 text-left transition"
                  >
                    <div className="text-lg mb-1">☁️ SaaS Platform</div>
                    <div className="text-sm text-gray-500">Business automation tools</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    projectState.stage === 'initial' ? "Describe your business idea..." :
                    projectState.stage === 'idea_capture' ? "Tell me more about your target market..." :
                    projectState.stage === 'persona_discovery' ? "Which user segment resonates most?" :
                    projectState.stage === 'competitive_analysis' ? "What's your unique angle?" :
                    "Continue the conversation..."
                  }
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visual Intelligence Panel */}
        <div className="w-96 bg-gray-100 border-l border-gray-200 p-6">
          <VisualIntelligence
            stage={projectState.stage}
            marketData={projectState.marketData}
            personas={projectState.personas}
            competitors={projectState.competitors}
            selectedPersona={projectState.selectedPersona}
          />
        </div>
      </div>
    </div>
  );
}

export default DevbrainApp;