import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execFileAsync = promisify(execFile);

export interface RenderMp4Options {
  width: number;
  height: number;
  fps: number;
  duration: number;
}

@Injectable()
export class FFmpegService {
  private readonly exportsDir = path.resolve(process.cwd(), 'exports');

  constructor() {
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async renderMp4(options: RenderMp4Options): Promise<string> {
    const { width, height, fps, duration } = options;

    if (!width || !height || !fps || !duration) {
      throw new Error('Invalid render options');
    }

    const outputPath = path.join(this.exportsDir, `export-${Date.now()}.mp4`);

    const args: string[] = [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=black:s=${width}x${height}:r=${fps}`,
      '-t',
      String(duration),
      '-c:v',
      'libx264',
      '-profile:v',
      'high',
      '-level',
      '4.0',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      outputPath,
    ];

    try {
      await execFileAsync('ffmpeg', args);
      return outputPath;
    } catch (error: unknown) {
      const err = error as { stderr?: string };

      console.error(
        'FFmpeg render failed:',
        err.stderr ?? 'Unknown FFmpeg error',
      );

      throw new Error('FFmpeg render failed');
    }
  }
}
