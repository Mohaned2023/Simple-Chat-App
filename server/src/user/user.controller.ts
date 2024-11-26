import { Body, Controller, Logger, Post, Res, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create.dto';
import { FormatAuthReturnInterface } from './interfaces';
import { Response } from 'express';
import { refreshTokenCookieConfig } from 'src/config/cookies.config';
import { omitObjectKeys } from 'src/utils/omit.util';

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
}
