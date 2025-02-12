import { Injectable, Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { 
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  SubscribeMessage, 
  WebSocketGateway
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessageDto } from 'src/message/dtos/message.dto';
import { WsValidationExceptionFilter } from './filters/ws-exception.filter';
import { MessageService } from 'src/message/message.service';
import { MessageEntity } from 'src/message/entities/message.entity';

@Injectable()
@UseFilters(new WsValidationExceptionFilter())
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

  private logger: Logger = new Logger(ChatGateway.name, {timestamp: true});


  private online: Map<number, Socket> = new Map()


  constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly messageService: MessageService
    ) {}

  handleConnection(client: Socket, ...args: any[]) {
    const token: string = client.handshake.query.token as string;
    if (!token) {
      this.logger.warn(`Client '${client.id}' doesn't have token!!`);
      return client.disconnect();
    }
    try {
      const ver = this.jwtService.verify(token, {secret: this.configService.get<string>("CHATAPP_JWT_SECRET") });
      client.data.userId = ver.id;
      client.data.username = ver.username;
      this.online.set(client.data.userId, client);
      this.logger.log(`Client '${client.data.username}' Connected.`);
    } catch (error) {
      client.emit('error', error);
      return client.disconnect();
    }
  }

  @UsePipes(new ValidationPipe({transform: true}))
  @SubscribeMessage('message')
  async handleMessage(
      @ConnectedSocket() client: Socket, 
      @MessageBody() payload: MessageDto
    ): Promise<MessageEntity> {
      if (payload.receiverId == client.data.userId) {
        client.emit('error', { message: 'Can NOT send message to your self!'});
        return;
      }
      const receiver = this.online.get(payload.receiverId);
      const message: MessageEntity = await this.messageService.create( 
          { senderId: client.data.userId, ...payload },
          !!receiver
        );
        if (receiver) {
          receiver.emit('message', message);
        }
      return message;
  }

  handleDisconnect(client: Socket) {
    this.online.delete(client.data.userId );
    this.logger.log(`Client '${client.data.username}' Disconnected.`);
  }
}
