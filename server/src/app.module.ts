import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './config/typeorm.config';
import { envConfig } from './config/env.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { ConversationModule } from './conversation/conversation.module';
import { ChatGateway } from './chat/chat.gateway';
import { ThrottlerModule } from '@nestjs/throttler';
import { rateLimitConfig } from './config/rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    TypeOrmModule.forRootAsync(typeormConfig),
    ThrottlerModule.forRoot(rateLimitConfig),
    AuthModule,
    UserModule,
    MessageModule,
    ConversationModule
  ],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
