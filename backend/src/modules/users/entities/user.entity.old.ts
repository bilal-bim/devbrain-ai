import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import { Project } from '@modules/projects/entities/project.entity';
import { TeamMember } from '@modules/team/entities/team-member.entity';
import { Notification } from '@modules/notifications/entities/notification.entity';

export enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
}

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  @Index()
  email: string;

  @Column({ unique: true })
  @HideField()
  @Index()
  auth0Id: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  @Field(() => String)
  @Index()
  subscriptionTier: SubscriptionTier;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  @Field(() => String)
  subscriptionStatus: SubscriptionStatus;

  @Column({ nullable: true })
  @HideField()
  stripeCustomerId?: string;

  @Column({ nullable: true })
  @HideField()
  hashedPassword?: string;

  @Column({ default: false })
  @Field()
  onboardingCompleted: boolean;

  @Column('jsonb', { default: {} })
  @Field(() => String) // Will be serialized as JSON string
  preferences: Record<string, any>;

  @Column({ nullable: true })
  @Field({ nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Project, (project) => project.owner)
  @Field(() => [Project])
  projects: Project[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  @Field(() => [TeamMember])
  teamMemberships: TeamMember[];

  @OneToMany(() => Notification, (notification) => notification.user)
  @Field(() => [Notification])
  notifications: Notification[];
}