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

@Entity( {name: 'conversations'} )
export class ConversationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId1: number;
    
    @Column()
    userId2: number;

    @OneToMany( () => MessageEntity, (message) => message.conversation )
    messages: string[];

    @Column({nullable: true})
    lastMessage: string;

    @UpdateDateColumn()
    lastActive: Date;

    @CreateDateColumn()
    createAt: Date;
}