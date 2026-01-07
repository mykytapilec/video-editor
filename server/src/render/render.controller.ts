import { Controller, Post, Body } from '@nestjs/common';
import { RenderService } from './render.service';
import { RenderRequestDto } from './dto/render-request.dto';

@Controller('render')
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Post()
  async render(@Body() body: RenderRequestDto) {
    return this.renderService.renderMp4(body.video);
  }
}
