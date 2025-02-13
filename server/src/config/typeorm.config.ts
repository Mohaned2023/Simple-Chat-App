import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { ConversationEntity } from "src/conversation/entities/conversation.entity";
import { MessageEntity } from "src/message/entities/message.entity";
import { UserEntity } from "src/user/entities/user.entity";

/**
 * typeormConfig object use to config the TypeOrmModule
 */
export const typeormConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('CHATAPP_DATABASE_HOST'),
        port: 0|configService.get<number>('CHATAPP_DATABASE_PORT'),
        username: configService.get<string>('CHATAPP_DATABASE_USERNAME'),
        password: configService.get<string>('CHATAPP_DATABASE_PASSWORD'),
        database: configService.get<string>('CHATAPP_DATABASE_NAME'),
        entities: [UserEntity, MessageEntity, ConversationEntity],
        synchronize: configService.get<string>('CHATAPP_DATABASE_SYNC') === 'true',
    })
};
