import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  
  // userId → Set of socketIds
  private userSockets = new Map<string, Set<string>>();

  addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.logger.log(`User ${userId} connected: socket ${socketId}`);
  }

  removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`User ${userId} disconnected: socket ${socketId}`);
  }

  getUserSockets(userId: string): string[] {
    return [...(this.userSockets.get(userId) || [])];
  }
}