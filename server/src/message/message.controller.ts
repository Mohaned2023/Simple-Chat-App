import { Controller, Get, Logger, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { MessageEntity } from './entities/message.entity';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';

@Controller('message')
export class MessageController {
    private readonly logger: Logger = new Logger(MessageController.name, {timestamp: true});
    private readonly ApiPath: string = '/api/v1/message';
    constructor(
        private messageService: MessageService
    ){}

    @UseGuards(JwtAuthGuard)
    @Get(':conversationId')
    getAll(
        @Param('conversationId', ParseIntPipe) conversationId: number,
        @GetUser() user: UserEntity
    ): Promise<MessageEntity[]> {
        this.logger.log(`GET '${this.ApiPath}/${conversationId}' by '${user.username}' to get all messages.`);
        return this.messageService.getAll(conversationId)
    }
}
