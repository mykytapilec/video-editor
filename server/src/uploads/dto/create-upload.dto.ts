import { IsString, IsArray } from 'class-validator';

export class CreateUploadDto {
  @IsString()
  userId!: string;

  @IsArray()
  @IsString({ each: true })
  urls!: string[];
}
