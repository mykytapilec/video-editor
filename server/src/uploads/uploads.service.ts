/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { Video, VideoStatus } from '../render/render.entity';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
  ) {}

  async handleFileUpload(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const video = this.videoRepo.create({
      userId,
      originalUrl: file.originalname,
      directUrl: '',
      status: VideoStatus.UPLOADING,
    });

    const saved = await this.videoRepo.save(video);

    const uploadDir = join(process.cwd(), 'server', 'uploads');
    const filename = `video_${saved.id}.mp4`;
    const sourcePath = join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(sourcePath, file.buffer);

    saved.sourcePath = sourcePath;
    saved.status = VideoStatus.VERIFIED;

    await this.videoRepo.save(saved);

    return {
      id: saved.id,
      sourcePath,
    };
  }
}
