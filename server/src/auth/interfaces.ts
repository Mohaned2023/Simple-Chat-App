/**
 * This interface use to create the JWT Payload
 * @field id - the id of the user.
 * @field username - the username of the user.
 */
export interface JwtPayloadInterface {
    id: number;
    username: string;
}