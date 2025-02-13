import { UserEntity } from "./entities/user.entity";

/**
 * FormatAuthReturnInterface is interface use\
 * to set the required fields to deal with\
 * the Auth.
 */
export interface FormatAuthReturnInterface {
    accessToken: string;
    refreshToken: string;
    user: UserEntity
}

/**
 * MessageReturnInterface is interface use\
 * to set the required fields to deal with\
 *  returning specific message.
 */
export interface MessageReturnInterface {
    message: string
}