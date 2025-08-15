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
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '@modules/users/entities/user.entity';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { ContextItem } from '@modules/context/entities/context-item.entity';
import { TeamMember } from '@modules/team/entities/team-member.entity';
import { ProgressEvent } from '@modules/progress/entities/progress-event.entity';
import { Integration } from '@modules/integrations/entities/integration.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  ON_HOLD = 'on_hold',
}

export enum ProjectType {
  WEB_APP = 'web_app',
  MOBILE_APP = 'mobile_app',
  SAAS = 'saas',
  ECOMMERCE = 'ecommerce',
  OTHER = 'other',
}

@Entity('projects')
@ObjectType()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  @Field(() => String)
  @Index()
  status: ProjectStatus;

  @Column({ nullable: true })
  @Field({ nullable: true })
  industry?: string;

  @Column('text', { array: true, default: [] })
  @Field(() => [String])
  targetUsers: string[];

  @Column('jsonb', { default: {} })
  @Field(() => String)
  techStack: Record<string, any>;

  @Column({ nullable: true })
  @Field({ nullable: true })
  @Index()
  githubRepo?: string;

  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.WEB_APP,
  })
  @Field(() => String)
  projectType: ProjectType;

  @Column('integer', { nullable: true })
  @Field(() => Int, { nullable: true })
  estimatedTimeline?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  estimatedBudget?: number;

  @Column('jsonb', { default: {} })
  @Field(() => String)
  marketAnalysis: Record<string, any>;

  @Column('jsonb', { default: {} })
  @Field(() => String)
  competitiveLandscape: Record<string, any>;

  @Column('jsonb', { default: {} })
  @Field(() => String)
  mvpScope: Record<string, any>;

  @Column('uuid')
  @Index()
  userId: string;

  @CreateDateColumn()
  @Field()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @Field(() => User)
  owner: User;

  @OneToMany(() => Conversation, (conversation) => conversation.project)
  @Field(() => [Conversation])
  conversations: Conversation[];

  @OneToMany(() => ContextItem, (contextItem) => contextItem.project)
  @Field(() => [ContextItem])
  contextItems: ContextItem[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.project)
  @Field(() => [TeamMember])
  teamMembers: TeamMember[];

  @OneToMany(() => ProgressEvent, (progressEvent) => progressEvent.project)
  @Field(() => [ProgressEvent])
  progressEvents: ProgressEvent[];

  @OneToMany(() => Integration, (integration) => integration.project)
  @Field(() => [Integration])
  integrations: Integration[];
}