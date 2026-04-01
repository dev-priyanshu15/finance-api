import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TodoGateway } from './todo.gateway';
import { GatewayService } from './gateway.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [TodoGateway, GatewayService],
  exports: [TodoGateway],
})
export class GatewayModule {}
