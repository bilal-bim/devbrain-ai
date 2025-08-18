import React, { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, Users, Target, Package, ChevronRight, Menu, X, BarChart3, MessageCircle, Lightbulb, DollarSign, Clock, Star } from 'lucide-react';

// Component to render AI responses as interactive cards
const AIResponseCards = ({ content, onFollowUp }: { content: string, onFollowUp: (text: string) => void }) => {
  // Parse content to extract actionable items
  const parseContentToCards = (text: string) => {
    const cards = [];
    
    // Extract competitors
    const competitorMatch = text.match(/(?:competitors?|competition).*?:?\s*(.*?)(?:\n\n|\.|$)/is);
    if (competitorMatch) {
      const competitors = competitorMatch[1]
        .split(/,|and|\n/)
        .map(c => c.trim())
        .filter(c => c.length > 0 && c.length < 50)
        .slice(0, 3);
      
      if (competitors.length > 0) {
        cards.push({
          type: 'competitors',
          icon: TrendingUp,
          title: '🏢 Key Competitors',
          items: competitors,
          action: 'Tell me more about how to differentiate from these competitors',
          color: 'red'
        });
      }
    }
    
    // Extract features
    const featureLines = text.split('\n').filter(line => 
      line.match(/^[\-•*]|\d+\./) && line.length > 10 && line.length < 100
    );
    
    if (featureLines.length > 0) {
      cards.push({
        type: 'features',
        icon: Target,
        title: '⚡ Key Features',
        items: featureLines.slice(0, 4).map(f => f.replace(/^[\-•*\d\.\s]+/, '')),
        action: 'Help me prioritize these features for my MVP',
        color: 'blue'
      });
    }
    
    // Extract market insights
    const marketMatch = text.match(/(?:market|opportunity|size|revenue).*?(\$[\d.]+[BM])/i);
    if (marketMatch) {
      cards.push({
        type: 'market',
        icon: DollarSign,
        title: '💰 Market Opportunity',
        items: [marketMatch[0]],
        action: 'How can I capture a portion of this market?',
        color: 'green'
      });
    }
    
    // Extract recommendations
    const recommendLines = text.split('\n').filter(line => 
      line.match(/recommend|suggest|consider|should/) && line.length > 20 && line.length < 150
    );
    
    if (recommendLines.length > 0) {
      cards.push({
        type: 'recommendations',
        icon: Lightbulb,
        title: '💡 Recommendations',
        items: recommendLines.slice(0, 3),
        action: 'Give me a detailed implementation plan for these recommendations',
        color: 'purple'
      });
    }
    
    return cards;
  };
  
  const cards = parseContentToCards(content);
  
  if (cards.length === 0) {
    // Fallback to text if no cards can be extracted
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onFollowUp("Can you give me more specific actionable steps?")}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <ChevronRight size={14} />
            <span>Ask for more details</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Show original text if it's short */}
      {content.length < 200 && (
        <div className="bg-white border border-gray-200 p-3 rounded-lg">
          <p className="text-gray-800 text-sm">{content}</p>
        </div>
      )}
      
      {/* Interactive cards */}
      {cards.map((card, index) => (
        <div key={index} className={`bg-white border-l-4 border-${card.color}-500 shadow-sm rounded-lg p-4`}>
          <div className="flex items-center space-x-2 mb-3">
            <card.icon size={18} className={`text-${card.color}-600`} />
            <h4 className="font-medium text-gray-800">{card.title}</h4>
          </div>
          
          <div className="space-y-2 mb-3">
            {card.items.map((item, i) => (
              <div key={i} className={`bg-${card.color}-50 p-2 rounded text-sm text-gray-700`}>
                {item}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => onFollowUp(card.action)}
            className={`w-full text-left text-sm text-${card.color}-600 hover:text-${card.color}-700 flex items-center justify-between group`}
          >
            <span>{card.action}</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ))}
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
      <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
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
          </div>
          
          {/* Desktop Stage Indicator */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">Stage: </span>
              <span className="font-medium text-blue-600">
                {projectState.stage.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Desktop Layout - Side by Side */}
        <div className="hidden md:flex w-full">
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
                          <AIResponseCards 
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
            <div className="border-t border-gray-200 bg-white p-4">
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
            <SimpleVisualization
              projectState={projectState}
              messages={messages}
            />
          </div>
        </div>
        
        {/* Mobile Layout - Tab Based */}
        <div className="md:hidden w-full">
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
                            <AIResponseCards 
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