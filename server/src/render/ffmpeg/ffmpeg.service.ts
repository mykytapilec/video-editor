import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { dirname } from 'path';
import { RenderMp4Options } from './render-mp4.options';

@Injectable()
export class FfmpegService {
  async renderMp4(options: RenderMp4Options): Promise<void> {
    const { width, height, fps, duration, outputPath } = options;

    fs.mkdirSync(dirname(outputPath), { recursive: true });

    const args = [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=black:s=${width}x${height}:r=${fps}`,
      '-t',
      String(duration),
      '-pix_fmt',
      'yuv420p',
      outputPath,
    ];

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited with code ${code}`));
      });
    });
  }
}
