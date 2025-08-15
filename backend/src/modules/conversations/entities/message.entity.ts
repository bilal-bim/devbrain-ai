import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Conversation } from './conversation.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VISUALIZATION = 'visualization',
}

export enum AIModel {
  CLAUDE = 'claude',
  QWEN = 'qwen',
  DEEPSEEK = 'deepseek',
}

@Entity('messages')
@ObjectType()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  @Index()
  conversationId: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
  })
  @Field(() => String)
  @Index()
  role: MessageRole;

  @Column('text')
  @Field()
  content: string;

  @Column({
    type: 'enum',
    enum: AIModel,
    nullable: true,
  })
  @Field(() => String, { nullable: true })
  @Index()
  aiModel?: AIModel;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  @Field(() => String)
  messageType: MessageType;

  @Column('jsonb', { default: {} })
  @Field(() => String)
  metadata: Record<string, any>;

  @Column('integer', { nullable: true })
  @Field(() => Int, { nullable: true })
  responseTimeMs?: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  qualityScore?: number;

  @CreateDateColumn()
  @Field()
  @Index()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  @Field(() => Conversation)
  conversation: Conversation;
}