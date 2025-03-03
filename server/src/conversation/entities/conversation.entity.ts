import { MessageEntity } from "src/message/entities/message.entity";
import { 
    BaseEntity, 
    Column, 
    CreateDateColumn, 
    Entity,
    OneToMany,
    PrimaryGeneratedColumn, 
    UpdateDateColumn 
} from "typeorm";

/**
 * ConversationEntity is class use to create and deal with\
 * the TypeORM for the Conversation.
 */
@Entity( {name: 'conversations'} )
export class ConversationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user1: string;
    
    @Column()
    user2: string;

    @OneToMany( () => MessageEntity, (message) => message.conversation )
    messages: string[];

    @Column({nullable: true})
    lastMessage: string;

    @UpdateDateColumn()
    lastActive: Date;

    @CreateDateColumn()
    createAt: Date;
}