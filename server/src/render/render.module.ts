import { Module } from '@nestjs/common';
import { RenderController } from './render.controller';
import { RenderService } from './render.service';
import { FfmpegService } from './ffmpeg/ffmpeg.service';

@Module({
  controllers: [RenderController],
  providers: [RenderService, FfmpegService],
})
export class RenderModule {}
