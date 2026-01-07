import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export interface RenderMp4Options {
  width: number;
  height: number;
  fps: number;
  duration: number;
}

@Injectable()
export class FFmpegService {
  private readonly exportsDir = path.join(process.cwd(), 'exports');

  constructor() {
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async renderMp4(options: RenderMp4Options): Promise<string> {
    const { width, height, fps, duration } = options;

    const filename = `export-${Date.now()}.mp4`;
    const outputPath = path.join(this.exportsDir, filename);

    const command = `
      ffmpeg -y
      -f lavfi -i color=c=black:s=${width}x${height}:r=${fps}
      -t ${duration}
      -pix_fmt yuv420p
      ${outputPath}
    `;

    await execAsync(command.replace(/\s+/g, ' ').trim());

    return outputPath;
  }

  async renderEmptyMp4(): Promise<string> {
    return this.renderMp4({
      width: 1280,
      height: 720,
      fps: 30,
      duration: 3,
    });
  }
}
