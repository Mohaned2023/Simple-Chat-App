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

    /**
     * create method use to create a new conversation\
     * between two users.
     * @param targetUsername the target user. 
     * @param user who use this method.
     * @throws NotFoundException if the target user not found. 
     * @returns Promise of ConversationEntity
     */
    async create(targetUsername: string, user: UserEntity): Promise<ConversationEntity> {
        const targetUser = await this.userRepository.findOne({
            where: { username: targetUsername.toLowerCase() }
        });
        if ( !targetUser ) throw new NotFoundException(`User '${targetUsername}' NOT found!`);
        let conversation = await this.conversationRepository
            .findOne({
                where: [
                    {user1: user.username, user2: targetUsername},
                    {user1: targetUsername, user2: user.username}
                ]
            });
        if ( conversation ) return conversation;
        conversation = this.conversationRepository.create();
        conversation.user1 = user.username;
        conversation.user2 = targetUsername;
        return await conversation.save() ;
    }
    
    /**
     * getAllUserConversations method use to get all conversations\
     * are related to the specific user.
     * @param user who use this method.
     * @returns Promise of ConversationEntity list.
     */
    async getAllUserConversations(user:UserEntity): Promise<ConversationEntity[]> {
        const conversations = await this.conversationRepository.find({
            where: [
                {user1: user.username},
                {user2: user.username}
            ]
        });
        if ( conversations.length < 1 ) throw new NotFoundException();
        return conversations;
    }
}
