import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { VideosModule } from './videos.module';

describe('VideosController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [VideosModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should serve the Bridgerton video', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .get('/videos/Bridgerton-S1-E1.mp4')
      .set('Range', 'bytes=0-0')
      .expect(206);

    expect(response.header['content-type']).toBe('video/mp4');
    expect(response.header['content-range']).toMatch(/bytes 0-0\/\d+/);
  });
});
