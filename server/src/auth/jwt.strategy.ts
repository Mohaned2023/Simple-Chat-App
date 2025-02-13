import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserEntity } from "src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtPayloadInterface } from "./interfaces";

/**
 * JwtStrategy is class use to identify the JWT strategy.
 * @extends PassportStrategy the type of the strategy uses.
 */
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

    /**
     * The validate methos use to check if user valid by searching in the database.
     * @param payload the decoded JWT.
     * @throws UnauthorizedException if user is not found in the database.
     * @returns Promise of UserEntity
     */
    async validate( payload: JwtPayloadInterface ): Promise<UserEntity> {
        const { username } = payload;
        const user = await this.userRepository.findOne( {where: {username}} );
        if (!user) throw new UnauthorizedException('User Not Found!');
        return user;
    }
}

