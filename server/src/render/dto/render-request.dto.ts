import { IsIn, IsObject } from 'class-validator';

export class RenderRequestDto {
  @IsObject()
  design!: Record<string, unknown>;

  @IsIn(['mp4'])
  format!: 'mp4';
}
