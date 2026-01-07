import { Injectable } from '@nestjs/common';
import { FFmpegService } from './ffmpeg/ffmpeg.service';

@Injectable()
export class RenderService {
  constructor(private readonly ffmpeg: FFmpegService) {}

  async exportEmptyVideo() {
    const path = await this.ffmpeg.renderEmptyMp4();

    return {
      path,
      url: `/exports/${path.split('/exports/')[1]}`,
    };
  }
}
