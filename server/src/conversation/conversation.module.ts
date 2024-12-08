import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConversationController } from './conversation.controller';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, UserEntity]),
    AuthModule
  ],
  providers: [ConversationService, JwtStrategy],
  exports: [ConversationService],
  controllers: [ConversationController]
})
export class ConversationModule {}
