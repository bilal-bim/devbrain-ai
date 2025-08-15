export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: any;
}

export interface AIProvider {
  name: string;
  generateResponse(messages: AIMessage[], options?: any): Promise<AIResponse>;
  isAvailable(): boolean;
}