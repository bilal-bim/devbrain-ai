import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    apiUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    temperature: 0.7,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 4096,
    temperature: 0.7,
  },
  qwen: {
    apiKey: process.env.QWEN_API_KEY,
    model: 'qwen-max',
    maxTokens: 4096,
    temperature: 0.7,
  },
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    maxTokens: 4096,
    temperature: 0.7,
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
    indexName: process.env.PINECONE_INDEX_NAME || 'devbrainai-contexts',
  },
}));