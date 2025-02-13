import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from 'src/auth/jwt.strategy';

/**
 * UserModule module use to deal with user Authentication\
 * like: register, login, update, delete and refresh tokens.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        AuthModule,
        ConfigModule
    ],
    controllers: [UserController],
    providers: [UserService, JwtStrategy],
})
export class UserModule {}
