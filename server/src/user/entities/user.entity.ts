import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * UserEntity is class use to create and deal with\
 * the TypeORM for the Users.
 */
@Entity( {name: 'users'} )
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50})
    username: string;

    @Column({ length: 100 })
    name: string;

    @Column({type: 'text'})
    password: string;

    @Column({type: 'text'})
    salt: string;

    @Column({unique: true, length: 100})
    email: string

    @Column({type: 'boolean', default: true})
    gender: boolean;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    create_at: Date;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    update_at: Date;
}
