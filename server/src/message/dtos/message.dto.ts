import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class MessageDto {
    @IsNotEmpty()
    @IsNumber()
    conversationId: number;

    @IsNotEmpty()
    @IsNumber()
    receiverId: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    body: string;
}