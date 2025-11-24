import { IsArray, ArrayNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateUploadDto {
  @IsString()
  userId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  urls!: string[];

  @IsOptional()
  meta?: any;
}
