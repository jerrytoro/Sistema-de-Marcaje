import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, TelegramService, PrismaService],
  exports: [NotificationsService, TelegramService],
})
export class NotificationsModule {}
