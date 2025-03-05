import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

/**
 * MessageDto is class use to create the message DTO.
 * @field conversationId - the conversation that message related to.
 * @field receiverId - the user who will receive the message.
 * @field body - the message content.
 */
export class MessageDto {
    @IsNotEmpty()
    @IsNumber()
    conversationId: number;

    @IsNotEmpty()
    @IsString()
    receiverUsername: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    body: string;
}