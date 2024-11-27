import { 
    Body, 
    Controller, 
    Get, 
    Logger, 
    Post, 
    Req, 
    Res, 
    UnauthorizedException,
    ValidationPipe 
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create.dto';
import { FormatAuthReturnInterface } from './interfaces';
import { Request, Response } from 'express';
import { refreshTokenCookieConfig } from 'src/config/cookies.config';
import { omitObjectKeys } from 'src/utils/omit.util';
import { LoginDto } from './dtos/login.dto';

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
    ) {
        this.logger.log(`POST '${this.ApiPath}/login' to login '${loginDto.username}'.`);
        const data: FormatAuthReturnInterface = await this.userService.login(loginDto);
        res.cookie('refreshToken', data.refreshToken, refreshTokenCookieConfig);
        res.status(201).json(omitObjectKeys(data, ['refreshToken']));
    }

    @Get('refresh')
    async refresh(
        @Req() req: Request,
        @Res() res: Response
    ) {
        this.logger.log(`GET '${this.ApiPath}/refresh to refresh the tokens.`);
        const { refreshToken } = req.cookies;
        if ( !refreshToken ) throw new UnauthorizedException();
        const data: FormatAuthReturnInterface = await this.userService.refresh(refreshToken);
        res.cookie('refreshToken', data.refreshToken, refreshTokenCookieConfig);
        res.status(201).json(omitObjectKeys(data, ['refreshToken']));
    }
}
