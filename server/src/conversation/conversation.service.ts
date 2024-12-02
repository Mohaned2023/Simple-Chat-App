import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationService {
    constructor( 
        @InjectRepository(ConversationEntity) 
        private conversationRepository: Repository<ConversationEntity>
    ) {}
}
