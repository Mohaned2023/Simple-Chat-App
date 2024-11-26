import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserEntity } from "src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtPayloadInterface } from "./interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @Inject(ConfigService) configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('CHATAPP_JWT_SECRET')
        })
    }

    async validate( payload: JwtPayloadInterface ): Promise<UserEntity> {
        const { username } = payload;
        const user = await this.userRepository.findOne( {where: {username}} );
        if (!user) throw new UnauthorizedException('User Not Found!');
        return user;
    }
}

