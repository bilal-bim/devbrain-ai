import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Edit3, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { cn, formatTime, getAIAvatar, getAIName } from '@/utils';
import type { Message } from '@/types';
import ReactMarkdown from 'react-markdown';

export interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  showActions?: boolean;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRegenerate,
  onEdit,
  onCopy,
  onFeedback,
  showActions = true,
  className
}) => {
  const [isActionsVisible, setIsActionsVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';
  const isSystem = message.role === 'system';

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else {
      try {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy message:', error);
      }
    }
  };

  const getBubbleStyles = () => {
    if (isUser) {
      return "bg-primary-600 text-white ml-12";
    } else if (isAI) {
      return "bg-white border border-gray-200 mr-12";
    } else {
      return "bg-gray-100 text-gray-700 mx-4";
    }
  };

  const getBubbleRadius = () => {
    if (isUser) {
      return "rounded-2xl rounded-br-md";
    } else if (isAI) {
      return "rounded-2xl rounded-bl-md";
    } else {
      return "rounded-lg";
    }
  };

  const getAvatarSrc = () => {
    if (isUser) return undefined; // Will show user avatar or fallback
    if (isAI) return getAIAvatar(message.aiModel);
    return undefined;
  };

  const getDisplayName = () => {
    if (isUser) return 'You';
    if (isAI) return getAIName(message.aiModel);
    return 'System';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("group flex gap-3 p-4", className)}
      onMouseEnter={() => setIsActionsVisible(true)}
      onMouseLeave={() => setIsActionsVisible(false)}
    >
      {/* Avatar - only show for AI and system messages */}
      {!isUser && (
        <Avatar
          src={getAvatarSrc()}
          fallback={isAI ? getAIName(message.aiModel)?.[0] : 'S'}
          size="md"
          className="flex-shrink-0"
        />
      )}

      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        {/* Message header */}
        <div className={cn(
          "flex items-center gap-2 mb-1",
          isUser && "flex-row-reverse"
        )}>
          <span className="text-sm font-medium text-gray-900">
            {getDisplayName()}
          </span>
          
          {/* AI Model badge */}
          {isAI && message.aiModel && (
            <Badge variant="outline" size="sm">
              {getAIName(message.aiModel)}
            </Badge>
          )}
          
          {/* Timestamp */}
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>

          {/* Optimistic/Temporary indicators */}
          {message.isOptimistic && (
            <Badge variant="warning" size="sm">
              Sending...
            </Badge>
          )}
          {message.isTemporary && (
            <Badge variant="info" size="sm">
              Temporary
            </Badge>
          )}
        </div>

        {/* Message bubble */}
        <div className={cn(
          "px-4 py-3 max-w-full break-words",
          getBubbleStyles(),
          getBubbleRadius()
        )}>
          {/* Message content */}
          {isAI ? (
            <div className={cn(
              "prose prose-sm max-w-none",
              "prose-headings:text-gray-900 prose-p:text-gray-700",
              "prose-pre:bg-gray-100 prose-pre:text-gray-800",
              "prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
              "prose-strong:text-gray-900 prose-em:text-gray-700",
              "prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
            )}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (isActionsVisible || isActionsVisible) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "flex items-center gap-1 mt-2",
              isUser && "flex-row-reverse"
            )}
          >
            {/* Copy button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Copy className="w-3 h-3" />}
              onClick={handleCopy}
              className="text-xs"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>

            {/* AI message actions */}
            {isAI && (
              <>
                {onRegenerate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RotateCcw className="w-3 h-3" />}
                    onClick={onRegenerate}
                    className="text-xs"
                  >
                    Regenerate
                  </Button>
                )}
                
                {onFeedback && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ThumbsUp className="w-3 h-3" />}
                      onClick={() => onFeedback('positive')}
                      className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ThumbsDown className="w-3 h-3" />}
                      onClick={() => onFeedback('negative')}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    />
                  </>
                )}
              </>
            )}

            {/* User message actions */}
            {isUser && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Edit3 className="w-3 h-3" />}
                onClick={onEdit}
                className="text-xs"
              >
                Edit
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* User avatar - positioned on the right */}
      {isUser && (
        <Avatar
          fallback="U"
          size="md"
          className="flex-shrink-0"
        />
      )}
    </motion.div>
  );
};

MessageBubble.displayName = 'MessageBubble';

export { MessageBubble };