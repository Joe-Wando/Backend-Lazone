import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { CLE_TOKEN_REVOQUE } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existant = await this.usersService.findByEmail(dto.email);
    if (existant) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      ...dto,
      password: hash,
    });

    return this.genererReponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const motDePasseValide = await bcrypt.compare(dto.password, user.password);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return this.genererReponse(user);
  }

  async logout(token: string): Promise<void> {
    const decode = this.jwtService.decode(token) as { exp?: number } | null;
    if (!decode?.exp) {
      return;
    }
    const secondesRestantes = decode.exp - Math.floor(Date.now() / 1000);
    if (secondesRestantes > 0) {
      await this.redisService.set(CLE_TOKEN_REVOQUE(token), '1', secondesRestantes);
    }
  }

  private genererReponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      },
    };
  }
}