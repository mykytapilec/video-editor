import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RenderService } from './render.service';
import { RenderRequestDto } from './dto/render-request.dto';

@Controller('api/render')
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Post()
  render(@Body() body: RenderRequestDto) {
    const { format } = body;

    if (format !== 'mp4') {
      throw new HttpException(
        'Only mp4 export is supported',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.renderService.renderMp4();
  }
}
