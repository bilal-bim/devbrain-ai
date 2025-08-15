import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Download, Share2 } from 'lucide-react';
import { MessageBubble } from '@/components/molecules/MessageBubble';
import { MessageInput } from '@/components/molecules/MessageInput';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { cn } from '@/utils';
import type { Message, Conversation } from '@/types';

export interface ConversationPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  selectedAI: 'claude' | 'qwen' | 'deepseek';
  isConnected: boolean;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onMessageRegenerate?: (messageId: string) => void;
  onMessageEdit?: (messageId: string, content: string) => void;
  onMessageFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  onAISwitch?: (ai: 'claude' | 'qwen' | 'deepseek') => void;
  onExport?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  className?: string;
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  conversation,
  messages,
  isLoading,
  selectedAI,
  isConnected,
  onSendMessage,
  onMessageRegenerate,
  onMessageEdit,
  onMessageFeedback,
  onAISwitch,
  onExport,
  onShare,
  onSettings,
  className
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [isAtBottom, setIsAtBottom] = React.useState(true);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Monitor scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setIsAtBottom(isNearBottom);
  };

  const handleSendMessage = (content: string, attachments?: File[]) => {
    onSendMessage(content, attachments);
    setInputValue('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
  };

  const aiOptions = [
    { value: 'claude' as const, label: 'Claude', color: 'bg-blue-500' },
    { value: 'qwen' as const, label: 'Qwen', color: 'bg-purple-500' },
    { value: 'deepseek' as const, label: 'DeepSeek', color: 'bg-green-500' }
  ];

  return (
    <div className={cn("flex flex-col h-full bg-gray-50", className)}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                AI Business Consultant
              </h2>
              {conversation && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={conversation.status === 'active' ? 'success' : 'default'}
                    size="sm"
                  >
                    {conversation.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {messages.length} messages
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* AI Model Selector */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {aiOptions.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => onAISwitch?.(value)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    selectedAI === value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  )}
                >
                  <div className="flex items-center gap-1">
                    <div className={cn("w-2 h-2 rounded-full", color)} />
                    {label}
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onExport && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={onExport}
                >
                  Export
                </Button>
              )}
              
              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Share2 className="w-4 h-4" />}
                  onClick={onShare}
                >
                  Share
                </Button>
              )}
              
              {onSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Settings className="w-4 h-4" />}
                  onClick={onSettings}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="min-h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="max-w-md text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to DevbrainAI
                </h3>
                <p className="text-gray-600 mb-6">
                  I'll help you transform your idea into a validated MVP with real market data and technical guidance.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "An app for freelancers",
                      "Social media for doctors", 
                      "Better way to book meetings"
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setInputValue(example)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onRegenerate={() => onMessageRegenerate?.(message.id)}
                  onEdit={() => onMessageEdit?.(message.id, message.content)}
                  onFeedback={(type) => onMessageFeedback?.(message.id, type)}
                />
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 p-4"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-20 right-6"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg"
          >
            ↓
          </Button>
        </motion.div>
      )}

      {/* Input Area */}
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        disabled={isLoading || !isConnected}
        placeholder="Tell me about your business idea..."
        supportedFormats={['text', 'voice', 'file']}
        autoFocus
      />
    </div>
  );
};

ConversationPanel.displayName = 'ConversationPanel';

export { ConversationPanel };