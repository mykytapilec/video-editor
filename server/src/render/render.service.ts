import { Injectable } from '@nestjs/common';
import { FFmpegService } from './ffmpeg/ffmpeg.service';
import { RenderVideoDto } from './dto/render-video.dto';

@Injectable()
export class RenderService {
  constructor(private readonly ffmpeg: FFmpegService) {}

  async renderMp4(
    video: RenderVideoDto,
  ): Promise<{ path: string; url: string }> {
    const outputPath = await this.ffmpeg.renderMp4({
      width: video.width,
      height: video.height,
      fps: video.fps,
      duration: video.duration,
    });

    return {
      path: outputPath,
      url: `/exports/${outputPath.split('/exports/')[1]}`,
    };
  }

  async exportEmptyVideo(): Promise<{
    path: string;
    url: string;
  }> {
    const outputPath = await this.ffmpeg.renderEmptyMp4();

    return {
      path: outputPath,
      url: `/exports/${outputPath.split('/exports/')[1]}`,
    };
  }
}
