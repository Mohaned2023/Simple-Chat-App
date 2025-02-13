import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * This class use to create a JWT Guard.
 * @extends AuthGuard
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
