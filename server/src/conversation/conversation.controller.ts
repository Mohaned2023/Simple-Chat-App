import { Controller, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { ConversationService } from './conversation.service';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConversationEntity } from './entities/conversation.entity';

@UseGuards(JwtAuthGuard)
@Controller('conversation')
export class ConversationController {
    private logger: Logger = new Logger(ConversationController.name, {timestamp: true});
    private readonly ApiPath = "/api/v1/conversation";
    constructor(
        private conversationService: ConversationService
    ) {}

    @Post(":username")
    create (
        @GetUser() user: UserEntity,
        @Param('username') username: string
    ): Promise<ConversationEntity> {
        this.logger.log(`POST '${this.ApiPath}/${username}' by '${user.username}' to create conversation with '${username}'.`);
        return this.conversationService.create(username, user);
    }
}
