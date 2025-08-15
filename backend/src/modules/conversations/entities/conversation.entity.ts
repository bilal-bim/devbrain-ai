import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Project } from '@modules/projects/entities/project.entity';
import { Message } from './message.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  PAUSED = 'paused',
}

export enum ConversationStage {
  DISCOVERY = 'discovery',
  ANALYSIS = 'analysis',
  SPECIFICATION = 'specification',
  COMPLETION = 'completion',
}

@Entity('conversations')
@ObjectType()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column('uuid')
  @Index()
  projectId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  sessionId?: string;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  @Field(() => String)
  @Index()
  status: ConversationStatus;

  @Column('integer', { default: 0 })
  @Field(() => Int)
  totalMessages: number;

  @Column('integer', { default: 0 })
  @Field(() => Int)
  totalTokens: number;

  @Column({ default: false })
  @Field()
  contextGenerated: boolean;

  @Column({
    type: 'enum',
    enum: ConversationStage,
    default: ConversationStage.DISCOVERY,
  })
  @Field(() => String)
  conversationStage: ConversationStage;

  @Column('integer', { nullable: true })
  @Field(() => Int, { nullable: true })
  satisfactionRating?: number;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  feedback?: string;

  @Column('jsonb', { default: {} })
  @Field(() => String)
  metadata: Record<string, any>;

  @CreateDateColumn()
  @Field()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, (project) => project.conversations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  @Field(() => Project)
  project: Project;

  @OneToMany(() => Message, (message) => message.conversation)
  @Field(() => [Message])
  messages: Message[];
}