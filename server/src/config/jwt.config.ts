import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModuleAsyncOptions } from "@nestjs/jwt";

/**
 * jwtConfig object use to config the JwtModule
 */
export const jwtConfig: JwtModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: ( configService: ConfigService ) => ({
        secret: configService.get<string>('CHATAPP_JWT_SECRET'),
        signOptions: {
            expiresIn: configService.get<string>('CHATAPP_JWT_EXPIRESIN')
        }
    })
}