import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class ConversationService {
    constructor( 
        @InjectRepository(ConversationEntity) 
            private conversationRepository: Repository<ConversationEntity>,
        @InjectRepository(UserEntity)
            private userRepository: Repository<UserEntity>
    ) {}

    // create a conversation
    async create(targetUsername: string, user: UserEntity): Promise<ConversationEntity> {
        const targetUser = await this.userRepository.findOne({
            where: { username: targetUsername.toLowerCase() }
        });
        if ( !targetUser ) throw new NotFoundException(`User '${targetUsername}' NOT found!`);
        let conversation = await this.conversationRepository
            .findOne({
                where: [
                    {userId1: user.id, userId2: targetUser.id},
                    {userId1: targetUser.id, userId2: user.id}
                ]
            });
        if ( conversation ) return conversation;
        conversation = this.conversationRepository.create();
        conversation.userId1 = user.id;
        conversation.userId2 = targetUser.id;
        return await conversation.save() ;
    }
    // get all conversations
    async getAllUserConversations(user:UserEntity): Promise<ConversationEntity[]> {
        const conversations = await this.conversationRepository.find({
            where: [
                {userId1: user.id},
                {userId2: user.id}
            ]
        });
        if ( conversations.length < 1 ) throw new NotFoundException();
        return conversations;
    }
    // get a conversation
}
