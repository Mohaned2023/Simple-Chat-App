import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { ConversationEntity } from 'src/conversation/entities/conversation.entity';
import { MessageController } from './message.controller';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { UserEntity } from 'src/user/entities/user.entity';

/**
 * MessageModule module use to deal with messages\
 * creation and getting.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity,ConversationEntity,UserEntity]),
    AuthModule
  ],
  providers: [MessageService, JwtStrategy],
  controllers: [MessageController],
  exports: [MessageService]
})
export class MessageModule {}
