import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('videos')
export class VideosController {
  private readonly videoPath = path.join(__dirname, '../../public/videos');

  @Get(':filename')
  getVideo(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Response | void {
    const filePath = path.join(this.videoPath, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
      return;
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }
}
