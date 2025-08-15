import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class ValidationService {
  // Email validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Project name validation
  validateProjectName(name: string): boolean {
    return name.length >= 3 && name.length <= 100 && /^[a-zA-Z0-9\s\-_]+$/.test(name);
  }

  // URL validation
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // GitHub repository URL validation
  validateGithubRepo(repoUrl: string): {
    valid: boolean;
    owner?: string;
    repo?: string;
  } {
    const githubRegex = /^https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/;
    const match = repoUrl.match(githubRegex);

    if (match) {
      return {
        valid: true,
        owner: match[1],
        repo: match[2],
      };
    }

    return { valid: false };
  }

  // JSON validation
  validateJson(jsonString: string): {
    valid: boolean;
    parsed?: any;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, parsed };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Sanitize HTML content
  sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
  }

  // Validate file upload
  validateFileUpload(file: {
    originalname: string;
    mimetype: string;
    size: number;
  }, options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options; // 5MB default

    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Joi schema validation wrapper
  async validateWithSchema<T>(data: any, schema: Joi.Schema): Promise<{
    valid: boolean;
    value?: T;
    errors?: string[];
  }> {
    try {
      const value = await schema.validateAsync(data);
      return { valid: true, value };
    } catch (error) {
      return {
        valid: false,
        errors: error.details?.map((detail: any) => detail.message) || [error.message],
      };
    }
  }

  // Common Joi schemas
  static schemas = {
    createProject: Joi.object({
      name: Joi.string().min(3).max(100).required(),
      description: Joi.string().max(1000).optional(),
      industry: Joi.string().max(100).optional(),
      targetUsers: Joi.array().items(Joi.string().max(100)).default([]),
      projectType: Joi.string().valid('web_app', 'mobile_app', 'saas', 'ecommerce', 'other').default('web_app'),
      estimatedTimeline: Joi.number().integer().min(1).max(365).optional(),
      estimatedBudget: Joi.number().positive().optional(),
      githubRepo: Joi.string().uri().optional(),
    }),

    updateUser: Joi.object({
      name: Joi.string().min(1).max(100).optional(),
      preferences: Joi.object().optional(),
    }),

    sendMessage: Joi.object({
      content: Joi.string().min(1).max(10000).required(),
      aiModel: Joi.string().valid('claude', 'qwen', 'deepseek').default('claude'),
      messageType: Joi.string().valid('text', 'image', 'file', 'visualization').default('text'),
    }),
  };
}