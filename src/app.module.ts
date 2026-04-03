import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecordsModule } from './records/records.module';
import { QueueModule } from './queue/queue.module';
import { GatewayModule } from './gateway/gateway.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
      { name: 'long', ttl: 3600000, limit: 1000 },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RecordsModule,
    QueueModule,
    GatewayModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}