import { Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ConversationService } from './conversation.service';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConversationEntity } from './entities/conversation.entity';

@UseGuards(JwtAuthGuard)
@Controller('conversation')
export class ConversationController {
    /**
   * use to log the events.
   */
    private logger: Logger = new Logger(ConversationController.name, {timestamp: true});
    /**
     * use to set the endpoint path.
     */
    private readonly ApiPath = "/api/v1/conversation";
    constructor(
        private conversationService: ConversationService
    ) {}

    /**
     * create method use to create new conversation.
     * @param user who use this method.
     * @param username the target user.
     * @returns Promise of ConversationEntity.
     */
    @Post(":username")
    create (
        @GetUser() user: UserEntity,
        @Param('username') username: string
    ): Promise<ConversationEntity> {
        this.logger.log(`POST '${this.ApiPath}/${username}' by '${user.username}' to create conversation with '${username}'.`);
        return this.conversationService.create(username, user);
    }

    /**
     * getAllUserConversations method use to get all conversations\
     * are related to the specific user.
     * @param user who use this method.
     * @returns Promise of ConversationEntity list.
     */
    @Get()
    getAllUserConversations(
        @GetUser() user: UserEntity
    ): Promise<ConversationEntity[]> {
        this.logger.log(`GET '${this.ApiPath}' by '${user.username}' to get all conversations.`);
        return this.conversationService.getAllUserConversations(user);
    }
}
