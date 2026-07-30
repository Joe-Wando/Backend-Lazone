import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { RedisService } from '../../redis/redis.service';
import { CLE_TOKEN_REVOQUE } from '../auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: { sub: string; email: string; role: string },
  ) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (token && (await this.redisService.exists(CLE_TOKEN_REVOQUE(token)))) {
      throw new UnauthorizedException('Ce token a été révoqué');
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    return user;
  }
}