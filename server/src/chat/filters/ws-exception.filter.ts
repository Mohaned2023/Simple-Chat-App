import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from "socket.io";

@Catch()
export class WsValidationExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const client: Socket = host.switchToWs().getClient();
        const response = exception.getResponse();
        client.emit('error', response);
    }
}