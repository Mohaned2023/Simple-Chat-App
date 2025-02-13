import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from "socket.io";

/**
 * WsValidationExceptionFilter is class use to filter the exceptions to\
 * emit the the exceptions to the client in the `error` event.
 * @extends BaseWsExceptionFilter
 */
@Catch()
export class WsValidationExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const client: Socket = host.switchToWs().getClient();
        const response = exception.getResponse();
        client.emit('error', response);
    }
}