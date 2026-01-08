import { Body, Controller, Post } from '@nestjs/common';
import { RenderService } from './render.service';
import { RenderRequestDto } from './dto/render-request.dto';

@Controller('render')
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Post()
  render(@Body() dto: RenderRequestDto) {
    return this.renderService.render(dto);
  }
}
