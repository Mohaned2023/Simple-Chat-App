import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { Repository } from 'typeorm';
import { MessageInterface } from './interfaces';
import { ConversationEntity } from 'src/conversation/entities/conversation.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(MessageEntity) 
        private messageRepository: Repository<MessageEntity>,
        @InjectRepository(ConversationEntity)
        private conversationRepository: Repository<ConversationEntity>
    ) {}

    /**
     * create method use to create a new message.
     * @param messageData the message data.
     * @param isDelivered if message is delivered.
     * @param isRead if message is read.
     * ---
     * @throws NotFoundException if conversation not found.
     * @throws NotFoundException if receiver not found in the conversation.
     * @throws UnauthorizedException if sender not found in the conversation.
     * ---
     * @returns Promise of MessageEntity.
     */
    async create(
        messageData: MessageInterface, 
        isDelivered: boolean=false, 
        isRead: boolean=false
    ): Promise<MessageEntity> {
        const conversation = await this.conversationRepository
            .findOne({where: {id: messageData.conversationId}});
        if (!conversation) throw new NotFoundException(`conversation with id '${messageData.conversationId}' NOT found!`);
        const usernames: string[] = [conversation.user1, conversation.user2];
        if ( !usernames.includes(messageData.receiverUsername) ) 
            throw new NotFoundException(`user '${messageData.receiverUsername}' NOT found in the conversation!`);
        if ( !usernames.includes(messageData.senderUsername) )
            throw new UnauthorizedException("You are NOT included in the conversation!!");
        Object.assign(conversation, {
            lastMessage: messageData.body,
            lastActive: new Date()
        });
        await conversation.save();
        const message = this.messageRepository.create();
        Object.assign(message, { 
            ...messageData,
            isDelivered,
            isRead
        });
        return await message.save();
    }

    /**
     * getAll method use to get all message that related\
     * to specific conversation.
     * @param conversationId the conversation id.
     * @param user who use this method.
     * ---
     * @throws UnauthorizedException if user is not included in the conversation.
     * @throws NotFoundException if ther is no messages.
     * ---
     * @returns Promise of MessageEntity list.
     */
    async getAll(conversationId: number, user:UserEntity ): Promise<MessageEntity[]> {
        const messages = await this.messageRepository
            .find({
                where: {conversationId}, 
                order: { createAt: 'ASC'}
            });
        if (messages.length < 1) throw new NotFoundException("Ther is NO messages!!");
        if(messages){
            const usernames: string[] = [messages[0].senderUsername, messages[0].receiverUsername];
            if ( !usernames.includes(user.username) )
                throw new UnauthorizedException("You are NOT included in the conversation!!")
            await this.setAsReaded( conversationId, messages[0].receiverUsername );
        }
        return messages;
    }

    /**
     * setAsReaded method use to set all unreaded message to readed.
     * @param conversationId the conversation id
     * @param receiverId the receiver id.
     */
    async setAsReaded(conversationId: number, receiverUsername: string): Promise<void> {
        await this.messageRepository
            .update(
            {
                conversationId,
                isRead: false,
                receiverUsername
            }, 
            {isRead: true} 
        );
    }
}
