import React, { useState, useEffect } from 'react';
import { VisualIntelligence } from './components/VisualIntelligence';
import { InteractiveMessage } from './components/InteractiveMessage';
import './styles/globals.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  interactive?: any;
}

interface ProjectState {
  stage: 'initial' | 'idea_capture' | 'persona_discovery' | 'competitive_analysis' | 'mvp_definition' | 'action_plan';
  marketData?: any;
  personas?: any[];
  competitors?: any[];
  selectedPersona?: string;
}

function DevbrainAppInteractive() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'initial'
  });

  // Parse AI responses to extract structured data and interactive elements
  const parseAIResponse = (response: string) => {
    const newState: Partial<ProjectState> = {};
    const interactive: any = {};
    
    // Detect stage and extract data
    if (response.includes('💰 Market Analysis')) {
      newState.stage = 'idea_capture';
      
      // Extract TAM
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
      
      // Extract focus area question for interactive options
      if (response.includes('are you thinking')) {
        const optionsMatch = response.match(/are you thinking ([^?]+)\?/i);
        if (optionsMatch) {
          const optionsText = optionsMatch[1];
          const options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
          if (options.length > 0) {
            interactive.options = options.map(opt => ({
              text: opt.replace(/^(or\s+)?/, ''),
              value: `I want to focus on ${opt.replace(/^(or\s+)?/, '')}`,
              icon: opt.includes('invoice') ? '📄' : opt.includes('payment') ? '💳' : '📊'
            }));
          }
        }
      }
    }
    
    if (response.includes('🎯 Target Segments') || response.includes('Target Users')) {
      newState.stage = 'persona_discovery';
      
      // Extract personas with interactive cards
      const personas = [];
      const sections = response.split(/\n\n/);
      
      sections.forEach(section => {
        // Look for persona patterns
        const lines = section.split('\n');
        let currentPersona: any = null;
        
        lines.forEach(line => {
          // Match persona header with emoji
          const headerMatch = line.match(/([🎨💻📝✍️👔🏥🎓])\s+(.+)/);
          if (headerMatch) {
            if (currentPersona) personas.push(currentPersona);
            currentPersona = {
              icon: headerMatch[1],
              name: headerMatch[2].trim(),
              size: '',
              avgIncome: '',
              painPoint: '',
              percentage: 0
            };
          }
          
          // Extract size
          const sizeMatch = line.match(/Size:\s*([^\|]+)/);
          if (sizeMatch && currentPersona) {
            currentPersona.size = sizeMatch[1].trim();
          }
          
          // Extract income
          const incomeMatch = line.match(/Avg Income:\s*([^\n]+)/);
          if (incomeMatch && currentPersona) {
            currentPersona.avgIncome = incomeMatch[1].trim();
          }
          
          // Extract pain point
          const painMatch = line.match(/Pain:\s*([\d.]+)%\s*(.+)/);
          if (painMatch && currentPersona) {
            currentPersona.percentage = parseFloat(painMatch[1]);
            currentPersona.painPoint = painMatch[2].trim();
          }
        });
        
        if (currentPersona) personas.push(currentPersona);
      });
      
      if (personas.length > 0) {
        newState.personas = personas;
        interactive.segments = personas;
      }
    }
    
    if (response.includes('🏆 Competition')) {
      newState.stage = 'competitive_analysis';
      
      // Extract competitors with interactive cards
      const competitors = [];
      const lines = response.split('\n');
      
      lines.forEach(line => {
        const compMatch = line.match(/^-?\s*([A-Za-z\s]+):\s*([\d.]+)%\s*(?:market share|share),?\s*(.+)/i);
        if (compMatch) {
          const strengthsWeaknesses = compMatch[3];
          const strengths = [];
          const weaknesses = [];
          
          // Simple extraction of strengths and weaknesses
          if (strengthsWeaknesses.includes('but')) {
            const parts = strengthsWeaknesses.split('but');
            if (parts[0]) strengths.push(parts[0].trim());
            if (parts[1]) weaknesses.push(parts[1].trim());
          } else {
            strengths.push(strengthsWeaknesses.trim());
          }
          
          competitors.push({
            name: compMatch[1].trim(),
            marketShare: parseFloat(compMatch[2]),
            strengths,
            weaknesses,
            pricing: '$30-50/mo' // Default, could be extracted if present
          });
        }
      });
      
      if (competitors.length > 0) {
        newState.competitors = competitors;
        interactive.competitors = competitors;
      }
    }
    
    if (response.includes('🚀 MVP Features')) {
      newState.stage = 'mvp_definition';
      
      // Extract features
      const features = { mustHave: [], niceToHave: [] };
      const lines = response.split('\n');
      let inMustHave = false;
      let inNiceToHave = false;
      
      lines.forEach(line => {
        if (line.includes('Must-Have')) inMustHave = true;
        if (line.includes('Nice-to-Have')) {
          inMustHave = false;
          inNiceToHave = true;
        }
        
        const featureMatch = line.match(/^\d+\.\s*(.+)|^•\s*(.+)/);
        if (featureMatch) {
          const feature = featureMatch[1] || featureMatch[2];
          if (inMustHave) features.mustHave.push(feature);
          if (inNiceToHave) features.niceToHave.push(feature);
        }
      });
      
      if (features.mustHave.length > 0 || features.niceToHave.length > 0) {
        interactive.features = features;
      }
      
      // Extract tech stack
      const techStack: any = {};
      const frontendMatch = response.match(/Frontend:\s*([^-\n]+)/);
      const backendMatch = response.match(/Backend:\s*([^-\n]+)/);
      const databaseMatch = response.match(/Database:\s*([^-\n]+)/);
      const paymentsMatch = response.match(/Payments:\s*([^-\n]+)/);
      
      if (frontendMatch) techStack.frontend = frontendMatch[1].trim();
      if (backendMatch) techStack.backend = backendMatch[1].trim();
      if (databaseMatch) techStack.database = databaseMatch[1].trim();
      if (paymentsMatch) techStack.payments = paymentsMatch[1].trim();
      
      if (Object.keys(techStack).length > 0) {
        interactive.techStack = techStack;
      }
    }
    
    if (response.includes('📋 Action Plan')) {
      newState.stage = 'action_plan';
    }
    
    return { newState, interactive };
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue;
    if (!messageToSend.trim() || isLoading) return;
    
    const userMessage: Message = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!message) setInputValue('');
    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          context: messages
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { newState, interactive } = parseAIResponse(data.data.content);
        
        const aiMessage: Message = {
          role: 'assistant',
          content: data.data.content,
          interactive
        };
        setMessages(prev => [...prev, aiMessage]);
        setProjectState(prev => ({ ...prev, ...newState }));
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
    handleSendMessage(text);
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
        
        alert('Context exported! Ready for import into Cursor, Replit, or Claude CLI.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export context');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💡 DevbrainAI</h1>
            <p className="text-sm text-gray-500">Transform Ideas into Deployed MVPs</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-gray-600">Stage: </span>
              <span className="font-medium text-blue-600">
                {projectState.stage.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <button 
              onClick={handleExportContext}
              disabled={messages.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Export conversation context for development tools"
            >
              📦 Export Context
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="max-w-3xl mx-auto text-center py-12">
                <div className="mb-4">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Hi! I'm your AI business consultant
                  </span>
                  <span className="text-4xl ml-2">👋</span>
                </div>
                <p className="text-lg text-gray-600 mb-8">
                  I'll help you turn your idea into a validated MVP with real market data and technical guidance.
                </p>
                <p className="text-gray-500 mb-8">
                  Choose an idea below or describe your own...
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleQuickAction("I want to build an app for freelancers to manage invoices")}
                    className="group relative p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <div className="text-3xl mb-3">📱</div>
                    <div className="text-lg font-semibold mb-2">Freelancer App</div>
                    <div className="text-sm opacity-90">Invoice & project management</div>
                    <div className="absolute top-2 right-2 bg-white text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                      Popular
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction("I need a marketplace for local services")}
                    className="group p-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl text-white hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <div className="text-3xl mb-3">🛍️</div>
                    <div className="text-lg font-semibold mb-2">Service Marketplace</div>
                    <div className="text-sm opacity-90">Connect buyers & sellers</div>
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction("I want to create a SaaS platform for small businesses")}
                    className="group p-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <div className="text-3xl mb-3">☁️</div>
                    <div className="text-lg font-semibold mb-2">SaaS Platform</div>
                    <div className="text-sm opacity-90">Business automation tools</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                      {msg.role === 'user' ? (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-4 py-3 shadow-md">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                          <InteractiveMessage
                            content={msg.content}
                            options={msg.interactive?.options}
                            segments={msg.interactive?.segments}
                            competitors={msg.interactive?.competitors}
                            features={msg.interactive?.features}
                            techStack={msg.interactive?.techStack}
                            onOptionClick={handleQuickAction}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-md">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
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
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visual Intelligence Panel - Fixed */}
        <div className="w-96 bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-6 pb-0 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-700">Visual Intelligence</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pt-4">
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
    </div>
  );
}

export default DevbrainAppInteractive;