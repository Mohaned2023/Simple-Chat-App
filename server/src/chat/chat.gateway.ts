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

/**
 * The Chat Gateway using the socket.io.
 * @implements OnGatewayConnection
 * @implements OnGatewayDisconnect
 */
@Injectable()
@UseFilters(new WsValidationExceptionFilter())
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

  /**
   * use to log the events.
   */
  private logger: Logger = new Logger(ChatGateway.name, {timestamp: true});

  /**
   * use to store the connected users with the Socket.\
   * using the Map datatype for O(1) search, add and delete time.
   */
  private online: Map<string, Socket> = new Map()


  constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly messageService: MessageService
    ) {}

  /**
   * handleConnection method use to handle the connection\
   * by checking and adding user socket connection to the\
   * online, checking coming wiht JWT verification, taking\
   * the JWT from the pramas.
   * @param client the client socket object.
   * @param args
   */
  handleConnection(client: Socket, ...args: any[]) {
    const token: string = client.handshake.query.token as string;
    if (!token) {
      this.logger.warn(`Client '${client.id}' doesn't have token!!`);
      return client.disconnect();
    }
    try {
      const ver = this.jwtService.verify(token, {secret: this.configService.get<string>("CHATAPP_JWT_SECRET") });
      client.data.username = ver.username;
      this.online.set(client.data.username, client);
      this.logger.log(`Client '${client.data.username}' Connected.`);
    } catch (error) {
      client.emit('error', error);
      return client.disconnect();
    }
  }

  /**
   * handleMessage method use to handle the messages in the message event.
   * @param client the client socket object.
   * @param payload the Message object.
   * @returns Promise of MessageEntity.
   */
  @UsePipes(new ValidationPipe({transform: true}))
  @SubscribeMessage('message')
  async handleMessage(
      @ConnectedSocket() client: Socket, 
      @MessageBody() payload: MessageDto
    ): Promise<MessageEntity> {
      if (payload.receiverUsername == client.data.username) {
        client.emit('error', { message: 'Can NOT send message to your self!'});
        return;
      }
      const receiver = this.online.get(payload.receiverUsername);
      const message: MessageEntity = await this.messageService.create( 
          { senderUsername: client.data.username, ...payload },
          !!receiver
        );
        if (receiver) {
          receiver.emit('message', message);
        }
      return message;
  }

  /**
   * handleDisconnect method use to handle the disconnection\
   * by deleting the client object from the online stat.
   * @param client the client socket object.
   */
  handleDisconnect(client: Socket) {
    this.online.delete(client.data.username);
    this.logger.log(`Client '${client.data.username}' Disconnected.`);
  }
}
