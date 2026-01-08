import { IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RenderVideoDto } from './render-video.dto';

export class RenderRequestDto {
  @IsIn(['mp4'])
  format!: 'mp4';

  @ValidateNested()
  @Type(() => RenderVideoDto)
  video!: RenderVideoDto;
}
