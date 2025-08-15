import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { ConversationPanel } from '@/components/organisms/ConversationPanel';
import { VisualizationCanvas } from '@/components/organisms/VisualizationCanvas';
import { Button } from '@/components/atoms/Button';
import { useAppStore, useConversationStore } from '@/stores';
import { cn } from '@/utils';
import type { Message, VisualizationData, MarketAnalysisData } from '@/types';

const ConversationPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, conversationId } = useParams<{ projectId: string; conversationId?: string }>();
  const [visualPanelOpen, setVisualPanelOpen] = useState(true);
  const [currentVisualization, setCurrentVisualization] = useState<VisualizationData | null>(null);

  // Global state
  const { project, conversation, socket } = useAppStore();
  const { conversations, getActiveConversation, createConversation, addMessage } = useConversationStore();

  // Mock data for development
  const mockVisualizationData: VisualizationData = {
    id: 'viz-1',
    type: 'market-analysis',
    title: 'Freelancer Invoice Market Analysis',
    data: {
      totalMarketSize: 2400,
      opportunities: [
        {
          id: '1',
          name: 'Invoicing Tools',
          marketSize: 450,
          growthRate: 12,
          competition: 7,
          difficulty: 6,
          category: 'Financial Tools',
          description: 'Invoice generation and management tools'
        },
        {
          id: '2',
          name: 'Payment Processing',
          marketSize: 320,
          growthRate: 15,
          competition: 8,
          difficulty: 7,
          category: 'Financial Tools',
          description: 'Payment gateway and processing solutions'
        },
        {
          id: '3',
          name: 'Client Management',
          marketSize: 180,
          growthRate: 8,
          competition: 5,
          difficulty: 4,
          category: 'CRM Tools',
          description: 'Client relationship and project management'
        },
        {
          id: '4',
          name: 'Time Tracking',
          marketSize: 290,
          growthRate: 10,
          competition: 6,
          difficulty: 5,
          category: 'Productivity',
          description: 'Time tracking and billing solutions'
        },
        {
          id: '5',
          name: 'Expense Management',
          marketSize: 150,
          growthRate: 7,
          competition: 4,
          difficulty: 3,
          category: 'Financial Tools',
          description: 'Expense tracking and reimbursement'
        }
      ],
      competitors: [],
      trends: []
    } as MarketAnalysisData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock messages for development
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'Hi! I\'m your AI business consultant. I\'ll help you turn your idea into a validated MVP with real market data and technical guidance.\n\nTell me about your business idea...',
      aiModel: 'claude',
      createdAt: new Date(Date.now() - 60000),
      metadata: {}
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<'claude' | 'qwen' | 'deepseek'>('claude');

  useEffect(() => {
    // Initialize visualization
    setCurrentVisualization(mockVisualizationData);
  }, []);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId || 'conv-1',
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
      metadata: {}
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        conversationId: conversationId || 'conv-1',
        role: 'assistant',
        content: generateAIResponse(content),
        aiModel: selectedAI,
        createdAt: new Date(),
        metadata: {}
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const generateAIResponse = (userContent: string): string => {
    const lowerContent = userContent.toLowerCase();
    
    if (lowerContent.includes('freelancer') || lowerContent.includes('invoice')) {
      return `Interesting! Let me start mapping this opportunity...

I see potential in the freelancer invoicing space. Based on my analysis:

**Market Opportunity:**
- Total addressable market: $2.4B
- Invoicing segment: $450M with 12% annual growth
- 2.3M+ creative freelancers in the US alone

**Key User Segments:**
🎨 **Creative Freelancers** (2.3M users, avg $45K income)
- Pain: 73% hate complex invoicing tools
- Opportunity: Mobile-first, design-focused solution

💻 **Tech Freelancers** (1.8M users, avg $75K income)  
- Pain: 68% want faster payment processing
- Opportunity: Developer-friendly integrations

📝 **Service Freelancers** (3.1M users, avg $35K income)
- Pain: 81% struggle with professional invoices
- Opportunity: Template-based simplicity

Which user segment resonates most with your vision?`;
    }

    return `Thank you for sharing that idea! Let me analyze the market opportunity and help you validate this concept.

I'm processing your input and will provide:
- Market size analysis
- Competitive landscape mapping  
- User persona identification
- Technical recommendations

Which aspect would you like to explore first?`;
  };

  const handleMessageRegenerate = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.role === 'assistant') {
      setIsLoading(true);
      setTimeout(() => {
        const newContent = generateAIResponse("regenerate");
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { ...m, content: newContent, updatedAt: new Date() }
            : m
        ));
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleExport = () => {
    console.log('Export context');
    // TODO: Implement context export
  };

  const handleShare = () => {
    console.log('Share conversation');
    // TODO: Implement sharing
  };

  const handleVisualizationClick = (dataPoint: any) => {
    console.log('Clicked visualization data point:', dataPoint);
    // Could add a message to the conversation or show details
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => navigate(`/app/projects/${projectId}`)}
        >
          Back to Project
        </Button>
      </div>

      {/* Main Conversation Area */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        visualPanelOpen ? "pr-96" : "pr-0"
      )}>
        <ConversationPanel
          conversation={null} // Using mock data for now
          messages={messages}
          isLoading={isLoading}
          selectedAI={selectedAI}
          isConnected={socket.isConnected}
          onSendMessage={handleSendMessage}
          onMessageRegenerate={handleMessageRegenerate}
          onMessageEdit={(messageId, content) => {
            console.log('Edit message:', messageId, content);
          }}
          onMessageFeedback={(messageId, type) => {
            console.log('Message feedback:', messageId, type);
          }}
          onAISwitch={setSelectedAI}
          onExport={handleExport}
          onShare={handleShare}
          onSettings={() => console.log('Settings')}
          className="h-full"
        />
      </div>

      {/* Visual Intelligence Panel */}
      <motion.div
        initial={false}
        animate={{
          width: visualPanelOpen ? 384 : 0,
          opacity: visualPanelOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg z-40 overflow-hidden"
      >
        <div className="w-96 h-full flex flex-col">
          {/* Panel Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Visual Intelligence</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVisualPanelOpen(false)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentVisualization ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    {currentVisualization.title}
                  </h4>
                  <VisualizationCanvas
                    data={currentVisualization}
                    type={currentVisualization.type}
                    onDataPointClick={handleVisualizationClick}
                    className="h-80"
                  />
                </div>

                {/* Additional Analysis Sections */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Key Insights
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">
                        💰 Large Market Opportunity
                      </div>
                      <div className="text-green-700">
                        $450M invoicing market with 12% growth
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">
                        🎯 Clear Target Segment
                      </div>
                      <div className="text-blue-700">
                        2.3M creative freelancers underserved
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">
                        🚀 Mobile-First Gap
                      </div>
                      <div className="text-purple-700">
                        Competitors lack mobile optimization
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Recommended Actions
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Focus on creative freelancers first
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Prioritize mobile-first design
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Start with core invoicing + payments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <p className="text-sm">
                    Visual insights will appear here as the conversation progresses
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Visual Panel Toggle (when closed) */}
      {!visualPanelOpen && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setVisualPanelOpen(true)}
            className="shadow-lg"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationPage;