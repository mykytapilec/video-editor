import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FFmpegService {
  private readonly logger = new Logger(FFmpegService.name);

  async renderEmptyMp4(): Promise<string> {
    const exportsDir = path.resolve(process.cwd(), 'exports');
    const outputPath = path.join(exportsDir, `export-${Date.now()}.mp4`);

    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    this.logger.log(`Rendering video → ${outputPath}`);

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-f',
        'lavfi',
        '-i',
        'color=c=black:s=1280x720:d=3',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        outputPath,
      ]);

      ffmpeg.stderr.on('data', (data: Buffer) => {
        this.logger.debug(data.toString());
      });

      ffmpeg.on('error', (err) => {
        reject(err);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          this.logger.log('FFmpeg finished successfully');
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
    });
  }
}
