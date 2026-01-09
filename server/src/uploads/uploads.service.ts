import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { execFile } from 'child_process';

import ffprobe from 'ffprobe-static';
import fetch, { Response } from 'node-fetch';

import { Video, VideoStatus } from '../render/render.entity';

function resolveFfprobePath(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    typeof (value as { path: unknown }).path === 'string'
  ) {
    return (value as { path: string }).path;
  }

  throw new Error('Invalid ffprobe-static export');
}

const ffprobePath = resolveFfprobePath(ffprobe);

export interface VideoMeta {
  duration: number;
  fps: number;
  hasAudio: boolean;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
  ) {}

  private toDropboxDirect(raw: string): string {
    try {
      const u = new URL(raw);

      if (u.hostname.endsWith('dropbox.com')) {
        return `${u.origin}${u.pathname}`
          .replace(u.hostname, 'dl.dropboxusercontent.com')
          .split('?')[0];
      }

      return raw;
    } catch {
      return raw;
    }
  }

  private async downloadFile(url: string, dest: string): Promise<void> {
    const res: Response = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to download: ${res.status} ${res.statusText}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    await mkdir(join(dest, '..'), { recursive: true });
    await writeFile(dest, buffer);
  }

  private getVideoMeta(filePath: string): Promise<VideoMeta> {
    return new Promise((resolve, reject) => {
      execFile(
        ffprobePath,
        [
          '-v',
          'error',
          '-print_format',
          'json',
          '-show_streams',
          '-show_format',
          filePath,
        ],
        (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }

          const parsed: {
            streams?: Array<{
              codec_type?: string;
              duration?: string;
              avg_frame_rate?: string;
            }>;
            format?: { duration?: string };
          } = JSON.parse(stdout);

          const video = parsed.streams?.find(
            (s) => s.codec_type === 'video',
          );
          const audio = parsed.streams?.find(
            (s) => s.codec_type === 'audio',
          );

          const duration = video?.duration
            ? Number(video.duration)
            : Number(parsed.format?.duration ?? 0);

          const fps = video?.avg_frame_rate
            ? (() => {
                const [a, b] = video.avg_frame_rate.split('/');
                return Number(a) / Number(b);
              })()
            : 30;

          resolve({
            duration,
            fps,
            hasAudio: Boolean(audio),
          });
        },
      );
    });
  }

  async createFromUrls(userId: string, urls: string[]): Promise<Video[]> {
    const results: Video[] = [];

    for (const rawUrl of urls) {
      const directUrl = this.toDropboxDirect(rawUrl);

      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.mp4`;

      const sourcePath = join(
        process.cwd(),
        'server',
        'uploads',
        filename,
      );

      await this.downloadFile(directUrl, sourcePath);

      const meta = await this.getVideoMeta(sourcePath);

      const video = this.videoRepo.create({
        userId,
        originalUrl: rawUrl,
        directUrl,
        sourcePath,
        duration: meta.duration,
        fps: meta.fps,
        hasAudio: meta.hasAudio,
        status: VideoStatus.UPLOADED,
      });

      results.push(await this.videoRepo.save(video));
    }

    return results;
  }
}
