import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dtos/create.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { FormatAuthReturnInterface } from './interfaces';
import { omitObjectKeys } from 'src/utils/omit.util';
import { JwtPayloadInterface } from 'src/auth/interfaces';

@Injectable()
export class UserService {
    private readonly logger: Logger = new Logger(UserService.name, {timestamp: true});
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async register(createDto: CreateUserDto): Promise<FormatAuthReturnInterface> {
        const user = this.userRepository.create();
        user.username = createDto.username;
        user.name = createDto.name;
        user.email = createDto.email;
        user.salt = await bcrypt.genSalt(0|this.configService.get<number>('CHATAPP_SALT_RANGE'));
        user.password = await bcrypt.hash(createDto.password, user.salt);
        user.gender = createDto.gender !== false;
        try {
            await user.save();
            this.logger.log(`Creating User '${user.username}'.`);
            return this.formatAuthReturn(user);
        } catch( error ) {
            if  (error.code == '23505' )
                throw new HttpException(`The username or email is already registered!`, HttpStatus.FOUND);
            throw new InternalServerErrorException();
        }
    }

    private formatAuthReturn(user: UserEntity): FormatAuthReturnInterface {
        const payload: JwtPayloadInterface = { id: user.id, username: user.username };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, {expiresIn: '7d'}),
            user: omitObjectKeys(user, ['password', 'salt']) as UserEntity
        }
    }
}
