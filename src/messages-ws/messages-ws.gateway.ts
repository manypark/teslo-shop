import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload';
import { NewMessageDto } from './dto/new-mesage.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway( { cors: true } )
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wsServer : Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtServices      : JwtService
  ) {}

  async handleConnection( client : Socket ) {

    const token = client.handshake.headers.authentication as string;
    let payload : JwtPayload;

    try {
      payload = this.jwtServices.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wsServer.emit( 'clientsUpdated' , this.messagesWsService.getConnectedClients() );
  }

  handleDisconnect( client : any ) {
    this.messagesWsService.removeClient( client.id );
    this.wsServer.emit( 'clientsUpdated' , this.messagesWsService.getConnectedClients() );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient( client : Socket, payload : NewMessageDto ) {

    // emite solo al cliente
    // client.emit('messageFromServer', { fullName: 'Soy yo', message: payload.message || 'no-message' });

    // emitir a todos, menos al cliente
    // client.broadcast.emit( 'messageFromServer', { fullName: 'Soy yo', message: payload.message || 'no-message' });

    // emitir a todos
    this.wsServer.emit( 'messageFromServer', { fullName: this.messagesWsService.getUserName( client.id ), message: payload.message || 'no-message' });
    
  }

}