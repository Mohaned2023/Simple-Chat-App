import { ConversationEntity } from "src/conversation/entities/conversation.entity";
import { 
    BaseEntity, 
    Column, 
    CreateDateColumn, 
    Entity, 
    ManyToOne, 
    PrimaryGeneratedColumn 
} from "typeorm";

/**
 * MessageEntity is class use to create and deal with\
 * the TypeORM for the Messages.
 */
@Entity({name:"messages"})
export class MessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    senderId: number;

    @Column()
    receiverId: number;

    @Column()
    conversationId: number;

    @ManyToOne( () => ConversationEntity, (conversation) => conversation.messages )
    conversation: ConversationEntity;

    @Column()
    body: string;

    @Column({default: false})
    isDelivered: boolean;

    @Column( {default: false} )
    isRead: boolean;

    @CreateDateColumn()
    createAt: Date;
}