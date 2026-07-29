import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findByEmailWithPassword: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const utilisateur = {
    id: 'user-1',
    email: 'test@lazone.sn',
    password: 'hash_du_mot_de_passe',
    nom: 'Diop',
    prenom: 'Awa',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findByEmailWithPassword: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('token.jwt.signe'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it("crée le compte et retourne un accessToken quand l'email est libre", async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash_du_mot_de_passe');
      usersService.create.mockResolvedValue(utilisateur);

      const resultat = await service.register({
        email: 'test@lazone.sn',
        password: 'motdepasse123',
        nom: 'Diop',
        prenom: 'Awa',
      });

      expect(resultat.accessToken).toBe('token.jwt.signe');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hash_du_mot_de_passe' }),
      );
    });

    it("lève ConflictException si l'email est déjà utilisé", async () => {
      usersService.findByEmail.mockResolvedValue(utilisateur);

      await expect(
        service.register({
          email: 'test@lazone.sn',
          password: 'motdepasse123',
          nom: 'Diop',
          prenom: 'Awa',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('retourne un accessToken avec les bons identifiants', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(utilisateur);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const resultat = await service.login({
        email: 'test@lazone.sn',
        password: 'motdepasse123',
      });

      expect(resultat.accessToken).toBe('token.jwt.signe');
    });

    it('lève UnauthorizedException si le mot de passe est incorrect', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(utilisateur);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@lazone.sn', password: 'mauvais' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("lève UnauthorizedException si l'email est inconnu", async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inconnu@lazone.sn', password: 'motdepasse123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
