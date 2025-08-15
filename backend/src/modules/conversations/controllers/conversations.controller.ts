import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete,
  Param, 
  Body, 
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/entities/user.entity';
import { ConversationsService } from '../services/conversations.service';
import { MessagesService } from '../services/messages.service';

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Post(':projectId')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  async createConversation(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.conversationsService.create(projectId, user.id);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get conversations for a project' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(
    @Param('projectId') projectId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.conversationsService.findByProject(projectId, limit, offset);
  }

  @Get(':projectId/active')
  @ApiOperation({ summary: 'Get active conversation for a project' })
  @ApiResponse({ status: 200, description: 'Active conversation retrieved' })
  async getActiveConversation(
    @Param('projectId') projectId: string,
  ) {
    return this.conversationsService.findActiveConversation(projectId);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation completed successfully' })
  async completeConversation(
    @Param('id') id: string,
    @Body() body: { satisfactionRating?: number; feedback?: string },
    @CurrentUser() user: User,
  ) {
    return this.conversationsService.complete(
      id,
      user.id,
      body.satisfactionRating,
      body.feedback,
    );
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() body: {
      content: string;
      aiModel?: string;
      messageType?: string;
    },
    @CurrentUser() user: User,
  ) {
    return this.messagesService.sendMessage({
      conversationId,
      content: body.content,
      aiModel: body.aiModel as any,
      messageType: body.messageType as any,
    }, user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Param('id') conversationId: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.messagesService.getMessages(conversationId, limit, offset);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get conversation statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getConversationStats(@Param('id') conversationId: string) {
    return this.messagesService.getMessageStats(conversationId);
  }
}