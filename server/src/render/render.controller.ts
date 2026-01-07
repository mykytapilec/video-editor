import { Controller, Post } from '@nestjs/common';
import { RenderService } from './render.service';

@Controller('render')
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Post('export')
  async export() {
    return this.renderService.exportEmptyVideo();
  }
}
