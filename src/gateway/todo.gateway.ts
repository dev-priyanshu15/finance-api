import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { GatewayService } from './gateway.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/todos',
})
export class TodoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TodoGateway.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private gatewayService: GatewayService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.headers.authorization?.replace('Bearer ', '') ||
        client.handshake.query.token as string;

      if (!token) throw new UnauthorizedException('No token');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.isDeleted) throw new UnauthorizedException();

      client.data.userId = user.id;
      client.join(`user:${user.id}`);
      this.gatewayService.addUserSocket(user.id, client.id);
      client.emit('connected', { message: 'Connected successfully' });

    } catch (error) {
      this.logger.warn(`Unauthorized: ${client.id}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.gatewayService.removeUserSocket(userId, client.id);
    }
    this.logger.log(`Disconnected: ${client.id}`);
  }

  emitTodoCreated(userId: string, todo: any) {
    this.server.to(`user:${userId}`).emit('todo:created', todo);
  }

  emitTodoUpdated(userId: string, todo: any) {
    this.server.to(`user:${userId}`).emit('todo:updated', todo);
  }

  emitTodoDeleted(userId: string, todoId: string) {
    this.server.to(`user:${userId}`).emit('todo:deleted', { id: todoId });
  }
}