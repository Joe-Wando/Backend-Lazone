import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const email = `test.e2e.${Date.now()}@lazone.sn`;
  const motDePasse = 'motdepasse123';
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register crée un compte (201)', async () => {
    const reponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: motDePasse, nom: 'Test', prenom: 'E2E' })
      .expect(201);

    expect(reponse.body.accessToken).toBeDefined();
  });

  it('POST /auth/register avec un email déjà utilisé (409)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: motDePasse, nom: 'Test', prenom: 'E2E' })
      .expect(409);
  });

  it('POST /auth/login avec les bons identifiants (200)', async () => {
    const reponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: motDePasse })
      .expect(200);

    expect(reponse.body.accessToken).toBeDefined();
    accessToken = reponse.body.accessToken;
  });

  it('POST /auth/login avec un mauvais mot de passe (401)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'mauvais_mot_de_passe' })
      .expect(401);
  });

  it('GET /auth/profile sans token (401)', async () => {
    await request(app.getHttpServer()).get('/auth/profile').expect(401);
  });

  it('GET /auth/profile avec un token valide (200)', async () => {
    const reponse = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(reponse.body.email).toBe(email);
  });
});
