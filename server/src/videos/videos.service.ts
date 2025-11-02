import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideosService {
  private readonly videoDir = path.resolve(__dirname, '../../public/videos');

  getVideoPath(filename: string): string {
    const videoPath = path.join(this.videoDir, filename);

    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('Video not found');
    }
    return videoPath;
  }

  getVideoStream(videoPath: string, range?: string) {
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };

      return { file, headers, statusCode: 206 };
    } else {
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      const file = fs.createReadStream(videoPath);
      return { file, headers, statusCode: 200 };
    }
  }
}
