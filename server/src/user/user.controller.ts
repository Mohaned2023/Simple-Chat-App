import { 
    Body, 
    Controller, 
    Get, 
    Logger, 
    Param, 
    Post, 
    Req, 
    Res, 
    UnauthorizedException,
    UseGuards,
    ValidationPipe 
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create.dto';
import { FormatAuthReturnInterface } from './interfaces';
import { Request, Response } from 'express';
import { refreshTokenCookieConfig } from 'src/config/cookies.config';
import { omitObjectKeys } from 'src/utils/omit.util';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { GetUser } from './decorators/get-user.decorator';
import { UserEntity } from './entities/user.entity';

@Controller('user')
export class UserController {
    private readonly logger: Logger = new Logger(UserController.name, {timestamp: true});
    private readonly ApiPath: string = '/api/v1/user';
    constructor( private userService: UserService ) {}

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

    @Post('login')
    async login(
        @Body(ValidationPipe) loginDto: LoginDto,
        @Res() res: Response
    ): Promise<void> {
        this.logger.log(`POST '${this.ApiPath}/login' to login '${loginDto.username}'.`);
        const data: FormatAuthReturnInterface = await this.userService.login(loginDto);
        res.cookie('refreshToken', data.refreshToken, refreshTokenCookieConfig);
        res.status(201).json(omitObjectKeys(data, ['refreshToken']));
    }

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
        res.status(201).json(omitObjectKeys(data, ['refreshToken']));
    }

    @UseGuards(JwtAuthGuard)
    @Get('info/:username')
    getInfo(
        @Param('username') username: string,
        @GetUser() user: UserEntity
    ): Promise<UserEntity> {
        this.logger.log(`GET '${this.ApiPath}/info/${username}' by '${user.username}'.` );
        return this.userService.getInfo(username, user);
    }
}
