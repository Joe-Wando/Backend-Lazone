import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async get(cle: string): Promise<string | null> {
    return this.client.get(cle);
  }

  async set(cle: string, valeur: string, ttlSecondes?: number): Promise<void> {
    if (ttlSecondes && ttlSecondes > 0) {
      await this.client.set(cle, valeur, 'EX', ttlSecondes);
    } else {
      await this.client.set(cle, valeur);
    }
  }

  async exists(cle: string): Promise<boolean> {
    const resultat = await this.client.exists(cle);
    return resultat === 1;
  }

  async del(cle: string): Promise<void> {
    await this.client.del(cle);
  }
}
