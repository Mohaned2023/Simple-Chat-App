import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    Logger, 
    Param, 
    Patch, 
    Post, 
    Req, 
    Res, 
    UnauthorizedException,
    UseGuards,
    ValidationPipe 
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create.dto';
import { FormatAuthReturnInterface, MessageReturnInterface } from './interfaces';
import { Request, Response } from 'express';
import { refreshTokenCookieConfig } from 'src/config/cookies.config';
import { omitObjectKeys } from 'src/utils/omit.util';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('user')
export class UserController {
    private readonly logger: Logger = new Logger(UserController.name, {timestamp: true});
    private readonly ApiPath: string = '/api/v1/user';
    constructor( private userService: UserService ) {}

    /**
     * register method use to create a new user.
     * @param createDto the user data.
     */
    @Post('register')
    async register( 
        @Body(ValidationPipe) createDto: CreateUserDto,
        @Res() res: Response
    ): Promise<void> {
        this.logger.log(`POST '${this.ApiPath}/register' to Create '${createDto.username}'.`);
        const data: FormatAuthReturnInterface = await this.userService.register( createDto );
        res.cookie('refreshToken', data.refreshToken, refreshTokenCookieConfig);
        res.status(201).json(omitObjectKeys(data, ['refreshToken']));
    }

    /**
     * login method use to login the user.
     * @param loginDto the login data.
     */
    @Post('login')
    async login(
        @Body(ValidationPipe) loginDto: LoginDto,
        @Res() res: Response
    ): Promise<void> {
        this.logger.log(`POST '${this.ApiPath}/login' to login '${loginDto.username}'.`);
        const data: FormatAuthReturnInterface = await this.userService.login(loginDto);
        res.cookie('refreshToken', data.refreshToken, refreshTokenCookieConfig);
        res.status(200).json(omitObjectKeys(data, ['refreshToken']));
    }

    /**
     * refresh method use to refresh the JWT token.
     */
    @Get('refresh')
    async refresh(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<void> {
        this.logger.log(`GET '${this.ApiPath}/refresh' to refresh the tokens.`);
        const { refreshToken } = req.cookies;
        if ( !refreshToken ) throw new UnauthorizedException();
        const data: FormatAuthReturnInterface = await this.userService.refresh(refreshToken);
        res.cookie('refreshToken', data.refreshToken, refreshTokenCookieConfig);
        res.status(200).json(omitObjectKeys(data, ['refreshToken']));
    }

    /**
     * getInfo method use to get user information.
     * @param username the target user username.
     * @param user who use this method.
     * @returns Promise of UserEntity.
     */
    @UseGuards(JwtAuthGuard)
    @Get('info/:username')
    getInfo(
        @Param('username') username: string,
        @GetUser() user: UserEntity
    ): Promise<UserEntity> {
        this.logger.log(`GET '${this.ApiPath}/info/${username}' by '${user.username}'.` );
        return this.userService.getInfo(username, user);
    }

    /**
     * update method use to update use informaion.
     * @param username the target user username.
     * @param updateUserDto the update data.
     * @param user who use this method.
     * @returns Promise of UserEntity.
     */
    @UseGuards(JwtAuthGuard)
    @Patch('update/:username')
    update(
        @Param('username') username: string,
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
        @GetUser() user: UserEntity
    ): Promise<UserEntity> {
        this.logger.log(`PATCH '${this.ApiPath}/udpate/${username}' by '${user.username}'.` );
        return this.userService.update(username, updateUserDto, user);
    }

    /**
     * delete method use to delete user.
     * @param username the target user username.
     * @param user who use this method.
     * @returns Promise of MessageReturnInterface
     */
    @UseGuards(JwtAuthGuard)
    @Delete('delete/:username')
    delete(
        @Param('username') username: string,
        @GetUser() user: UserEntity
    ): Promise<MessageReturnInterface> {
        this.logger.log(`DELETE '${this.ApiPath}/delete/${username}' by '${user.username}'.` );
        return this.userService.delete(username, user);
    }
}
