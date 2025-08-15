import { 
  Resolver, 
  Query, 
  Mutation, 
  Args, 
  ID,
  Int,
  Subscription,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { Conversation } from '../entities/conversation.entity';
import { ConversationsService } from '../services/conversations.service';

const pubSub = new PubSub();

@Resolver(() => Conversation)
@UseGuards(JwtAuthGuard)
export class ConversationsResolver {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  @Query(() => Conversation)
  async conversation(@Args('id', { type: () => ID }) id: string): Promise<Conversation> {
    return this.conversationsService.findById(id);
  }

  @Query(() => [Conversation])
  async conversations(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<Conversation[]> {
    return this.conversationsService.findByProject(projectId, limit, offset);
  }

  @Mutation(() => Conversation)
  async createConversation(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: User,
  ): Promise<Conversation> {
    const conversation = await this.conversationsService.create(projectId, user.id);
    
    // Publish to subscription
    pubSub.publish('conversationCreated', { 
      conversationCreated: conversation,
      projectId,
    });

    return conversation;
  }

  @Mutation(() => Conversation)
  async completeConversation(
    @Args('id', { type: () => ID }) id: string,
    @Args('satisfactionRating', { type: () => Int, nullable: true }) satisfactionRating?: number,
    @Args('feedback', { nullable: true }) feedback?: string,
    @CurrentUser() user: User,
  ): Promise<Conversation> {
    const conversation = await this.conversationsService.complete(
      id,
      user.id,
      satisfactionRating,
      feedback,
    );

    // Publish to subscription
    pubSub.publish('conversationCompleted', { 
      conversationCompleted: conversation,
    });

    return conversation;
  }

  @Mutation(() => Conversation)
  async archiveConversation(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Conversation> {
    return this.conversationsService.archive(id, user.id);
  }

  @Subscription(() => Conversation, {
    filter: (payload, variables) => {
      return payload.projectId === variables.projectId;
    },
  })
  conversationUpdated(
    @Args('projectId', { type: () => ID }) projectId: string,
  ) {
    return pubSub.asyncIterator(['conversationCreated', 'conversationCompleted']);
  }
}