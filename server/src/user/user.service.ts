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
import { FormatAuthReturnInterface, MessageReturnInterface } from './interfaces';
import { omitObjectKeys } from 'src/utils/omit.util';
import { JwtPayloadInterface } from 'src/auth/interfaces';
import { LoginDto } from './dtos/login.dto';
import { UpdateUserDto } from './dtos/update.dto';

@Injectable()
export class UserService {
    private readonly logger: Logger = new Logger(UserService.name, {timestamp: true});
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    /**
     * register method use to create a new user.
     * @param createDto the create data.
     * ---
     * @throws HttpException with FOUND - if user found in the datebase. 
     * ---
     * @returns Promise of FormatAuthReturnInterface.
     */
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

    /**
     * login method use to login the user.
     * @param loginDto the login data.
     * ---
     * @throws HttpException with NOT FOUND - if user not found.
     * @throws UnauthorizedException - if password invalid.
     * ---
     * @returns Promise of FormatAuthReturnInterface.
     */
    async login(loginDto: LoginDto): Promise<FormatAuthReturnInterface> {
        const { username, password } = loginDto;
        const user: UserEntity = await this.userRepository.findOne({where: {username}});
        if ( !user ) throw new HttpException(`User wiht username '${username}' NOT found!`, HttpStatus.NOT_FOUND);
        const hashedPassword = await bcrypt.hash( password, user.salt );
        if ( hashedPassword !== user.password ) throw new UnauthorizedException();
        this.logger.log(`The user with username '${username}' loged in...`);
        return this.formatAuthReturn(user);
    }

    /**
     * refresh method use to refresh the JWT token.
     * @param refreshToken the old token.
     * ---
     * @throws UnauthorizedException - if user is not found.
     * ---
     * @returns Promise of FormatAuthReturnInterface.
     */
    async refresh( refreshToken: string ): Promise<FormatAuthReturnInterface> {
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

    /**
     * getInfo method use to get user information.
     * @param username the target user username.
     * @param user who use this method.
     * ---
     * @throws HttpException with BAD REQUEST - if username invalid.
     * @throws HttpException with NOT FOUND - if user not found.
     * ---
     * @returns Promise of UserEntity
     */
    async getInfo(username: string, user: UserEntity): Promise<UserEntity> {
        username = username.toLowerCase();
        if ( username.length < 3 ) throw new HttpException(`Invalid username '${username}'!`, HttpStatus.BAD_REQUEST);
        let userInfo = await this.userRepository.findOne({where: {username}});
        if ( !userInfo ) throw new HttpException(`Username '${username}' NOT found!`, HttpStatus.NOT_FOUND);
        userInfo = omitObjectKeys(userInfo, ['password', 'salt']) as UserEntity;
        if ( username != user.username ) userInfo = omitObjectKeys(userInfo, ['email', 'create_at', 'update_at']) as UserEntity;
        this.logger.log(`User '${user.username}' obtained '${username}' information.`);
        return userInfo;
    }

    /**
     * update method use to update use informaion.
     * @param username the target user username.
     * @param updateUserDto the update data.
     * @param user who use this method.
     * ---
     * @throws HttpException with BAD REQUEST - if username invalid.
     * @throws UnauthorizedException - if user username != target username.
     * @throws HttpException with BAD REQUEST - if ther is invalid fields in the body.
     * ---
     * @returns Promise of UserEntity.
     */
    async update(username: string, updateUserDto: UpdateUserDto, user: UserEntity): Promise<UserEntity> {
        username = username.toLowerCase();
        const updateUserDtoKeys: string[] = Object.keys(updateUserDto);
        if ( 
            username.length < 3 ||
            updateUserDtoKeys.length < 1
        ) throw new HttpException('Username is invalid or body is missing!', HttpStatus.BAD_REQUEST);
        if ( user.username !== username ) {
            // This user can not update another user.
            this.logger.warn(`User '${user.username}' tried to update '${username}'!!!`);
            throw new UnauthorizedException(`You cann't update another user!`);
        }
        const updatefields: string[] = [
            'username',
            'password',
            'name',
            'gender'
        ];
        if ( 
            !updateUserDtoKeys.every( (key) => updatefields.includes(key) )
        ) throw new HttpException(`Ther is invalid fields in the body!`, HttpStatus.BAD_REQUEST);
        const userData = await this.userRepository.findOne({where: {username} });
        Object.assign( userData, updateUserDto);
        if ( updateUserDto.password ) userData.password = await bcrypt.hash(updateUserDto.password, userData.salt);
        userData.update_at = new Date();
        this.logger.log(`User '${username}' has been updated.`);
        return omitObjectKeys(userData, ['password', 'salt']) as UserEntity;
    }

    /**
     * delete method use to delete user.
     * @param username the target user username.
     * @param user who use this method.
     * ---
     * @throws HttpException with BAD REQUEST - if username invalid.
     * @throws UnauthorizedException - if user username != target username.
     * @throws HttpException with NOT FOUND - if user not found.
     * ---
     * @returns Promise of MessageReturnInterface
     */
    async delete( username: string, user: UserEntity): Promise<MessageReturnInterface> {
        username = username.toLowerCase();
        if ( username.length < 3 ) throw new HttpException(`Invalid username '${username}'!`, HttpStatus.BAD_REQUEST);
        if ( user.username !== username ) {
            // This user can not delete another user.
            this.logger.warn(`User '${user.username}' tried to delete '${username}'!!!`);
            throw new UnauthorizedException(`You cann't delete another user!`);
        }
        const {affected} = await this.userRepository.delete({ username });
        if ( affected < 0 ) throw new HttpException(`User '${username}' NOT found!`, HttpStatus.NOT_FOUND);
        this.logger.log(`User '${username}' has been deleted.`);
        return {
            message: `The user '${username}' deleted successfully.`
        }
    }

    /**
     * formatAuthReturn method user to create the FormatAuthReturnInterface.
     * @param user who will create the data for.
     * @returns FormatAuthReturnInterface
     */
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
