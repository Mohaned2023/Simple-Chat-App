import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { Repository } from 'typeorm';
import { MessageInterface } from './interfaces';
import { ConversationEntity } from 'src/conversation/entities/conversation.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(MessageEntity) 
        private messageRepository: Repository<MessageEntity>,
        @InjectRepository(ConversationEntity)
        private conversationRepository: Repository<ConversationEntity>
    ) {}

    async create(
        messageData: MessageInterface, 
        isDelivered: boolean=false, 
        isRead: boolean=false
    ): Promise<MessageEntity> {
        const conversation = await this.conversationRepository
            .findOne({where: {id: messageData.conversationId}});
        Object.assign(conversation, {
            lastMessage: messageData.body,
            lastActive: new Date()
        });
        await conversation.save();
        const message = this.messageRepository.create();
        // TODO: DELETE the conversationID form messageData and add the conversation object.
        Object.assign(message, { 
            ...messageData,
            isDelivered,
            isRead
        });
        return await message.save();
    }

    async getAll(conversationId: number): Promise<MessageEntity[]> {
        // TODO fix: Any user can get any conversation messages!!
        const messages = await this.messageRepository
            .find({
                where: {conversationId}, 
                order: { createAt: 'ASC'}
            });
        return messages;
    }

    async setAsReaded(conversationId: number, receiverId: number): Promise<void> {
        await this.messageRepository
            .update(
            {
                conversationId,
                isRead: false,
                receiverId
            }, 
            {isRead: true} 
        );
    }
}
