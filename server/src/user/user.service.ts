import { 
    HttpException, 
    HttpStatus, 
    Injectable, 
    InternalServerErrorException, 
    Logger, 
    UnauthorizedException 
} from '@nestjs/common';
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
import { LoginDto } from './dtos/login.dto';

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

    async login(loginDto: LoginDto): Promise<FormatAuthReturnInterface> {
        const { username, password } = loginDto;
        const user: UserEntity = await this.userRepository.findOne({where: {username}});
        if ( !user ) throw new HttpException(`User wiht username '${username}' NOT found!`, HttpStatus.NOT_FOUND);
        const hashedPassword = await bcrypt.hash( password, user.salt );
        if ( hashedPassword !== user.password ) throw new UnauthorizedException();
        this.logger.log(`The user with username '${username}' loged in...`);
        return this.formatAuthReturn(user);
    }

    async refresh( refreshToken: string ) {
        try {
            // nestjs can not catch the verify error!!!
            const decoded = this.jwtService.verify( refreshToken, {ignoreExpiration: false});
            const user = await this.userRepository.findOne({ where: {username: decoded.username } });
            if ( !user ) throw new UnauthorizedException();
            return this.formatAuthReturn(user);
        } catch( error ) {
            throw new UnauthorizedException();
        }
    }

    private formatAuthReturn(user: UserEntity): FormatAuthReturnInterface {
        const payload: JwtPayloadInterface = { id: user.id, username: user.username };
        this.logger.log(`Create accessToken and refreshToken for '${user.username}'`);
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, {expiresIn: '7d'}),
            user: omitObjectKeys(user, ['password', 'salt']) as UserEntity
        }
    }
}
