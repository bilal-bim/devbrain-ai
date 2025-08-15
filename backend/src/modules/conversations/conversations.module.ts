import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '@modules/ai/ai.module';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationsService } from './services/conversations.service';
import { MessagesService } from './services/messages.service';
import { ConversationsResolver } from './resolvers/conversations.resolver';
import { MessagesResolver } from './resolvers/messages.resolver';
import { ConversationsController } from './controllers/conversations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    AiModule,
  ],
  providers: [
    ConversationsService,
    MessagesService,
    ConversationsResolver,
    MessagesResolver,
  ],
  controllers: [ConversationsController],
  exports: [ConversationsService, MessagesService],
})
export class ConversationsModule {}