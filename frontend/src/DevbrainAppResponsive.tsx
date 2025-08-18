import React, { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, Users, Target, Package, ChevronRight, Menu, X, BarChart3, MessageCircle, Lightbulb, DollarSign, Clock, Star, Download } from 'lucide-react';

// Component to render AI responses with beautiful formatting
const AIResponseDisplay = ({ content, onFollowUp }: { content: string, onFollowUp: (text: string) => void }) => {
  // Parse content into sections for better formatting
  const formatContent = (text: string) => {
    // Clean up markdown formatting
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold **text**
    text = text.replace(/\*(.*?)\*/g, '$1'); // Remove italic *text*
    text = text.replace(/`(.*?)`/g, '$1'); // Remove code backticks
    
    const sections = [];
    const lines = text.split('\n');
    let currentSection = { type: 'text', content: [], title: '' };
    
    lines.forEach((line) => {
      // Check for headers (lines ending with : or containing keywords)
      if (line.match(/^(.*?):?\s*$/) && line.length > 3 && line.length < 50 && 
          (line.includes(':') || line.match(/^(##?|###?)\s/) || 
           line.match(/market|competition|features|mvp|tech|recommendation|next step/i))) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { 
          type: 'section', 
          title: line.replace(/^#+\s*/, '').replace(/:$/, ''), 
          content: [] 
        };
      }
      // Check for list items
      else if (line.match(/^[\s]*[-•*]\s/) || line.match(/^[\s]*\d+\.\s/)) {
        if (currentSection.type !== 'list') {
          if (currentSection.content.length > 0) {
            sections.push(currentSection);
          }
          currentSection = { type: 'list', content: [], title: '' };
        }
        currentSection.content.push(line.replace(/^[\s]*[-•*\d.]\s*/, ''));
      }
      // Regular text
      else if (line.trim()) {
        if (currentSection.type !== 'text' && currentSection.type !== 'section') {
          if (currentSection.content.length > 0) {
            sections.push(currentSection);
          }
          currentSection = { type: 'text', content: [], title: '' };
        }
        currentSection.content.push(line);
      }
    });
    
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };
  
  const sections = formatContent(content);
  
  // Generate smart follow-up questions
  const followUpQuestions = [];
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('competitor')) {
    followUpQuestions.push({ icon: '🎯', text: "How do I differentiate from competitors?" });
  }
  if (contentLower.includes('feature') || contentLower.includes('mvp')) {
    followUpQuestions.push({ icon: '⚡', text: "Which features should I build first?" });
  }
  if (contentLower.includes('market') || contentLower.includes('customer')) {
    followUpQuestions.push({ icon: '👥', text: "How do I validate with customers?" });
  }
  if (contentLower.includes('tech') || contentLower.includes('stack')) {
    followUpQuestions.push({ icon: '🛠️', text: "What's the best tech stack?" });
  }
  if (contentLower.includes('pricing') || contentLower.includes('revenue')) {
    followUpQuestions.push({ icon: '💰', text: "How should I price this?" });
  }
  
  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 space-y-4">
          {sections.map((section, i) => {
            // Section with title
            if (section.type === 'section' && section.title) {
              return (
                <div key={i} className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    {section.title.match(/market/i) && <span>📊</span>}
                    {section.title.match(/competitor/i) && <span>🏢</span>}
                    {section.title.match(/feature|mvp/i) && <span>⚡</span>}
                    {section.title.match(/tech|stack/i) && <span>🔧</span>}
                    {section.title.match(/customer|user/i) && <span>👥</span>}
                    {section.title.match(/recommendation|next/i) && <span>💡</span>}
                    <span>{section.title}</span>
                  </h3>
                  <div className="text-gray-700 pl-7">
                    {section.content.join(' ')}
                  </div>
                </div>
              );
            }
            // List items
            else if (section.type === 'list') {
              return (
                <div key={i} className="space-y-2">
                  {section.content.map((item, j) => (
                    <div key={j} className="flex items-start space-x-3 group">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
            // Regular text
            else {
              return (
                <div key={i} className="text-gray-700 leading-relaxed">
                  {section.content.join(' ')}
                </div>
              );
            }
          })}
        </div>
        
        {/* Follow-up questions */}
        {followUpQuestions.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
            <div className="flex flex-wrap gap-2">
              {followUpQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUp(question.text)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-blue-600 transition-all group"
                >
                  <span>{question.icon}</span>
                  <span>{question.text}</span>
                  <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple visualization component for now
const SimpleVisualization = ({ projectState, messages }: { projectState: any, messages: any[] }) => {
  if (messages.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Visual Intelligence</h3>
        <p className="text-sm text-gray-500">Charts and insights will appear here as you chat</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Project Overview</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2"><strong>Stage:</strong> {projectState.stage.replace('_', ' ').toUpperCase()}</p>
          {projectState.businessIdea && (
            <p className="text-sm text-gray-600"><strong>Idea:</strong> {projectState.businessIdea.substring(0, 100)}...</p>
          )}
        </div>
      </div>

      {projectState.competitors && projectState.competitors.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">🏢 Competitors</h4>
          <div className="space-y-2">
            {projectState.competitors.slice(0, 5).map((competitor: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{competitor.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${competitor.strength || 70}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{Math.round(competitor.strength || 70)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectState.mvpFeatures && projectState.mvpFeatures.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">⚡ MVP Features</h4>
          <div className="space-y-2">
            {projectState.mvpFeatures.slice(0, 5).map((feature: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium">{feature.name}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      feature.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {feature.priority}
                    </span>
                    <span className="text-xs text-gray-500">{feature.effort}d effort</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-700 mb-3">💬 Conversation Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
            <div className="text-xs text-blue-600">Messages</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(messages.length / 2)}</div>
            <div className="text-xs text-green-600">Insights</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ProjectState {
  stage: string;
  businessIdea: string;
  targetSegments: any[];
  competitors: any[];
  mvpFeatures: any[];
  techStack: any;
}

export default function DevbrainAppResponsive() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'ideation',
    businessIdea: '',
    targetSegments: [],
    competitors: [],
    mvpFeatures: [],
    techStack: null
  });
  const [activeView, setActiveView] = useState<'chat' | 'visual'>('chat');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: TrendingUp, text: "I want to build a SaaS platform for freelancers to manage invoices and payments", color: "blue" },
    { icon: Users, text: "Help me validate a mobile app idea for meal planning and grocery delivery", color: "green" },
    { icon: Target, text: "I have an idea for an AI-powered fitness coach app - what should my MVP include?", color: "purple" },
    { icon: Package, text: "I want to create a social media scheduling tool - what's the best tech stack?", color: "orange" }
  ];

  const extractVisualizationData = (content: string) => {
    // Extract structured data from AI response for visualization
    const data: any = {};
    
    // Extract market size
    const marketMatch = content.match(/market.*?(\$[\d.]+[BM])/i);
    if (marketMatch) {
      data.marketSize = marketMatch[1];
    }
    
    // Extract competitors
    const competitorsMatch = content.match(/competitors?:?\s*(.*?)(?:\.|$)/gi);
    if (competitorsMatch) {
      const competitors = competitorsMatch[0]
        .replace(/competitors?:?\s*/i, '')
        .split(/,|and/)
        .map(c => c.trim())
        .filter(c => c.length > 0 && c.length < 50);
      
      if (competitors.length > 0) {
        setProjectState(prev => ({
          ...prev,
          competitors: competitors.map((name, i) => ({
            name,
            strength: 70 + Math.random() * 25,
            marketShare: 20 + Math.random() * 30
          }))
        }));
      }
    }
    
    // Extract features
    const featuresMatch = content.match(/features?.*?:.*?[\n\-•]/gi);
    if (featuresMatch) {
      const features = content
        .split(/[\n\-•]/)
        .filter(line => line.match(/\w+/) && line.length > 10 && line.length < 100)
        .slice(0, 5)
        .map((feature, i) => ({
          name: feature.trim().replace(/^\d+\.?\s*/, ''),
          priority: i < 3 ? 'high' : 'medium',
          effort: Math.floor(Math.random() * 5) + 3
        }));
      
      if (features.length > 0) {
        setProjectState(prev => ({
          ...prev,
          mvpFeatures: features
        }));
      }
    }
    
    // Update stage based on conversation
    if (content.toLowerCase().includes('target') || content.toLowerCase().includes('customer')) {
      setProjectState(prev => ({ ...prev, stage: 'validation' }));
    } else if (content.toLowerCase().includes('feature') || content.toLowerCase().includes('mvp')) {
      setProjectState(prev => ({ ...prev, stage: 'planning' }));
    } else if (content.toLowerCase().includes('tech') || content.toLowerCase().includes('stack')) {
      setProjectState(prev => ({ ...prev, stage: 'development' }));
    }
    
    return data;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          context: messages
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.content,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Extract and update visualization data
        extractVisualizationData(data.data.content);
        
        // Update business idea if this is the first substantial message
        if (!projectState.businessIdea && inputValue.length > 20) {
          setProjectState(prev => ({
            ...prev,
            businessIdea: inputValue
          }));
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to connect to AI service. Please check the backend is running.',
        timestamp: new Date()
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

  const handleExportContext = () => {
    const exportData = {
      projectName: 'DevBrain AI Session',
      timestamp: new Date().toISOString(),
      stage: projectState.stage,
      businessIdea: projectState.businessIdea,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      insights: {
        competitors: projectState.competitors,
        features: projectState.mvpFeatures,
        targetSegments: projectState.targetSegments
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devbrain-context-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickAction = async (text: string) => {
    setInputValue(text);
    
    // Auto-send the message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: messages
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.content,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Extract and update visualization data
        extractVisualizationData(data.data.content);
        
        // Update business idea if this is the first substantial message
        if (!projectState.businessIdea && text.length > 20) {
          setProjectState(prev => ({
            ...prev,
            businessIdea: text
          }));
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to connect to AI service. Please check the backend is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">💡 DevbrainAI</h1>
              <p className="text-xs md:text-sm text-gray-500 hidden md:block">Transform Ideas into Deployed MVPs</p>
            </div>
          </div>
          
          {/* Mobile View Toggle */}
          <div className="flex md:hidden space-x-2">
            <button
              onClick={() => setActiveView('chat')}
              className={`p-2 rounded-lg ${activeView === 'chat' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <MessageCircle size={20} />
            </button>
            <button
              onClick={() => setActiveView('visual')}
              className={`p-2 rounded-lg ${activeView === 'visual' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={handleExportContext}
              disabled={messages.length === 0}
              className="p-2 rounded-lg text-gray-500 disabled:opacity-50"
              title="Export"
            >
              <Download size={20} />
            </button>
          </div>
          
          {/* Desktop Stage Indicator and Export */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">Stage: </span>
              <span className="font-medium text-blue-600">
                {projectState.stage.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleExportContext}
              disabled={messages.length === 0}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Export conversation context"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex relative" style={{ paddingTop: '64px' }}>
        {/* Desktop Layout - Side by Side */}
        <div className="hidden md:flex w-full" style={{ height: 'calc(100vh - 64px)' }}>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.text)}
                        className={`p-4 rounded-lg border-2 border-gray-200 hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-all text-left group`}
                      >
                        <action.icon className={`w-6 h-6 text-${action.color}-500 mb-2`} />
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">
                          {action.text}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'user' ? (
                        <div className="bg-blue-600 text-white p-4 rounded-lg max-w-[80%]">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.timestamp && (
                            <p className="text-xs mt-2 text-blue-100">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-[80%]">
                          <AIResponseDisplay 
                            content={message.content} 
                            onFollowUp={(text) => handleQuickAction(text)}
                          />
                          {message.timestamp && (
                            <p className="text-xs mt-2 text-gray-400">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 p-4 rounded-lg">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
              <div className="max-w-3xl mx-auto flex space-x-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your business idea..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send size={20} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Visual Intelligence Panel */}
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                <BarChart3 size={18} />
                <span>Visual Intelligence</span>
              </h3>
            </div>
            <SimpleVisualization
              projectState={projectState}
              messages={messages}
            />
          </div>
        </div>
        
        {/* Mobile Layout - Tab Based */}
        <div className="md:hidden w-full" style={{ height: 'calc(100vh - 64px)' }}>
          {activeView === 'chat' ? (
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                      Hi! I'm your AI consultant 👋
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Turn your idea into a validated MVP with real market data.
                    </p>
                    
                    <div className="space-y-3">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.text)}
                          className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <action.icon className="w-5 h-5 text-blue-500" />
                            <p className="text-sm text-gray-700">{action.text}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'user' ? (
                          <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[85%]">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        ) : (
                          <div className="max-w-[85%]">
                            <AIResponseDisplay 
                              content={message.content} 
                              onFollowUp={(text) => handleQuickAction(text)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
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
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Mobile Input Area */}
              <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your idea..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white overflow-y-auto">
              <SimpleVisualization
                projectState={projectState}
                messages={messages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}