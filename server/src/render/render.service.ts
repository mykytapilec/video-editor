// server/src/render/render.service.ts
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { RenderRequestDto } from './dto/render-request.dto';
import { FfmpegService } from './ffmpeg/ffmpeg.service';

@Injectable()
export class RenderService {
  constructor(private readonly ffmpegService: FfmpegService) {}

  async render(dto: RenderRequestDto) {
    const { video } = dto;
    const { width, height, fps, duration, groupId } = video;

    const filename = `video_${groupId}.mp4`;
    const outputPath = join(process.cwd(), 'server', 'exports', filename);

    await this.ffmpegService.renderMp4({
      width,
      height,
      fps,
      duration,
      outputPath,
    });

    return {
      path: outputPath,
      url: `/exports/${filename}`,
    };
  }
}
