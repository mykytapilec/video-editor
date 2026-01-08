import { IsInt, Min } from 'class-validator';

export class RenderVideoDto {
  @IsInt()
  @Min(1)
  width!: number;

  @IsInt()
  @Min(1)
  height!: number;

  @IsInt()
  @Min(1)
  fps!: number;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsInt()
  @Min(1)
  groupId!: number;
}
