import React, { useRef, useCallback } from 'react';
import { Send, Paperclip, Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/utils';
import type { BaseComponentProps } from '@/types';

export interface MessageInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string, attachments?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  supportedFormats?: ('text' | 'voice' | 'file')[];
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  isRecording?: boolean;
  autoFocus?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  maxLength = 4000,
  supportedFormats = ['text'],
  acceptedFileTypes = ".pdf,.doc,.docx,.txt,.md",
  maxFileSize = 10 * 1024 * 1024, // 10MB
  onVoiceStart,
  onVoiceEnd,
  isRecording = false,
  autoFocus = false,
  className
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 120); // max 5 lines
      textarea.style.height = `${scrollHeight}px`;
    }
  }, []);

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() || attachments.length > 0) {
      onSend(value.trim(), attachments);
      onChange('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxFileSize) {
        console.warn(`File ${file.name} is too large (${file.size} bytes)`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // max 5 files
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      onVoiceEnd?.();
    } else {
      onVoiceStart?.();
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const canSend = (value.trim() || attachments.length > 0) && !disabled;

  return (
    <div className={cn("border-t border-gray-200 bg-white", className)}>
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm"
              >
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-32">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div
          className={cn(
            "relative flex items-end gap-3 p-3 border rounded-2xl transition-colors",
            isDragOver 
              ? "border-primary-500 bg-primary-50" 
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50"
          )}
          onDragOver={supportedFormats.includes('file') ? handleDragOver : undefined}
          onDragLeave={supportedFormats.includes('file') ? handleDragLeave : undefined}
          onDrop={supportedFormats.includes('file') ? handleDrop : undefined}
        >
          {/* File input (hidden) */}
          {supportedFormats.includes('file') && (
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          )}

          {/* File attachment button */}
          {supportedFormats.includes('file') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileButtonClick}
              disabled={disabled}
              className="flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          )}

          {/* Text input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Recording..." : placeholder}
              disabled={disabled || isRecording}
              maxLength={maxLength}
              rows={1}
              className={cn(
                "w-full min-h-[24px] max-h-[120px] resize-none border-0 outline-none bg-transparent",
                "placeholder:text-gray-500 text-sm leading-6",
                isRecording && "text-red-600"
              )}
              style={{ height: '24px' }}
            />
            
            {/* Character counter */}
            {value.length > maxLength * 0.8 && (
              <div className="text-xs text-gray-400 text-right mt-1">
                {value.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Voice recording button */}
          {supportedFormats.includes('voice') && (
            <Button
              type="button"
              variant={isRecording ? "danger" : "ghost"}
              size="sm"
              onClick={handleVoiceToggle}
              disabled={disabled}
              className="flex-shrink-0"
            >
              {isRecording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Send button */}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!canSend}
            className="flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Drag and drop hint */}
        {isDragOver && supportedFormats.includes('file') && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-50 bg-opacity-90 rounded-2xl border-2 border-dashed border-primary-500">
            <div className="text-primary-700 font-medium">
              Drop files to attach
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

MessageInput.displayName = 'MessageInput';

export { MessageInput };