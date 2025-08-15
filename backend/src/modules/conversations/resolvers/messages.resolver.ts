import { 
  Resolver, 
  Query, 
  Mutation, 
  Args, 
  ID,
  Int,
  Subscription,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { Message, AIModel, MessageType } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { MessagesService } from '../services/messages.service';
import { ConversationsService } from '../services/conversations.service';

const pubSub = new PubSub();

@Resolver(() => Message)
@UseGuards(JwtAuthGuard)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  @Query(() => [Message])
  async messages(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<Message[]> {
    return this.messagesService.getMessages(conversationId, limit, offset);
  }

  @Query(() => Message)
  async message(@Args('id', { type: () => ID }) id: string): Promise<Message> {
    return this.messagesService.findById(id);
  }

  @Mutation(() => Message)
  async sendMessage(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('content') content: string,
    @Args('aiModel', { type: () => String, defaultValue: AIModel.CLAUDE }) aiModel: AIModel,
    @Args('messageType', { type: () => String, defaultValue: MessageType.TEXT }) messageType: MessageType,
    @CurrentUser() user: User,
  ): Promise<Message> {
    const message = await this.messagesService.sendMessage({
      conversationId,
      content,
      aiModel,
      messageType,
    }, user.id);

    // Publish to subscription for real-time updates
    pubSub.publish('messageAdded', { 
      messageAdded: message,
      conversationId,
    });

    return message;
  }

  @ResolveField(() => Conversation)
  async conversation(@Parent() message: Message): Promise<Conversation> {
    if (message.conversation) {
      return message.conversation;
    }
    return this.conversationsService.findById(message.conversationId);
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      return payload.conversationId === variables.conversationId;
    },
  })
  messageAdded(
    @Args('conversationId', { type: () => ID }) conversationId: string,
  ) {
    return pubSub.asyncIterator('messageAdded');
  }
}