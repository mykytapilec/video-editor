import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Video, VideoStatus, VideoMeta } from '../videos/video.entity';

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
        const cleaned = `${u.origin}${u.pathname}`.replace(
          u.hostname,
          'dl.dropboxusercontent.com',
        );
        return cleaned.split('?')[0];
      }

      if (raw.includes('dl=0')) {
        return raw.replace('dl=0', 'dl=1');
      }

      return raw;
    } catch {
      return raw;
    }
  }

  private async verifyUrlHead(
    url: string,
  ): Promise<{ ok: boolean; acceptRanges?: string; contentLength?: number }> {
    try {
      const head = await fetch(url, { method: 'HEAD', redirect: 'follow' });

      if (head.ok) {
        const acceptRanges = head.headers.get('accept-ranges') ?? undefined;
        const cl = head.headers.get('content-length');
        return {
          ok: true,
          acceptRanges,
          contentLength: cl ? Number(cl) : undefined,
        };
      }

      const get = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        redirect: 'follow',
      });

      if (get.status === 206 || get.status === 200) {
        const acceptRanges = get.headers.get('accept-ranges') ?? undefined;
        const cl = get.headers.get('content-length');
        return {
          ok: true,
          acceptRanges,
          contentLength: cl ? Number(cl) : undefined,
        };
      }

      return { ok: false };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown fetch error';
      this.logger.warn(`verifyUrlHead failed for ${url}: ${msg}`);
      return { ok: false };
    }
  }

  async createFromUrls(userId: string, urls: string[]) {
    const results: Video[] = [];

    for (const rawUrl of urls) {
      const originalUrl = rawUrl;
      const directUrl = this.toDropboxDirect(rawUrl);

      let status: VideoStatus = VideoStatus.UNVERIFIED;
      let meta: VideoMeta | undefined;

      const verification = await this.verifyUrlHead(directUrl);

      if (verification.ok) {
        status = VideoStatus.VERIFIED;
        meta = {
          acceptRanges: verification.acceptRanges,
          contentLength: verification.contentLength,
        };
      }

      const video = this.videoRepo.create({
        userId,
        originalUrl,
        directUrl,
        status,
        meta,
      });

      const saved = await this.videoRepo.save(video);
      results.push(saved);
    }

    return results;
  }
}
