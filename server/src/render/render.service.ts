import { Injectable } from '@nestjs/common';
import { FFmpegService } from './ffmpeg/ffmpeg.service';
import { RenderRequestDto } from './dto/render-request.dto';

@Injectable()
export class RenderService {
  constructor(private readonly ffmpeg: FFmpegService) {}

  async renderMp4(video: RenderRequestDto['video']): Promise<{
    path: string;
    url: string;
  }> {
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
}
