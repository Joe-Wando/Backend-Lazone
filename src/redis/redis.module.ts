import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get('REDIS_HOST'),
          port: +config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD') || undefined,
        }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
