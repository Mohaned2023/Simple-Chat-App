import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity])
  ],
  providers: [ConversationService],
  exports: [ConversationService]
})
export class ConversationModule {}
