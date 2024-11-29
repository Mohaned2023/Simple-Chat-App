import { UserEntity } from "./entities/user.entity";

export interface FormatAuthReturnInterface {
    accessToken: string;
    refreshToken: string;
    user: UserEntity
}

export interface MessageReturnInterface {
    message: string
}