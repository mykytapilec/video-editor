import { Module } from '@nestjs/common';
import { RenderController } from './render.controller';
import { RenderService } from './render.service';
import { FFmpegService } from './ffmpeg/ffmpeg.service';

@Module({
  controllers: [RenderController],
  providers: [RenderService, FFmpegService],
})
export class RenderModule {}
