import { IsString, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name!: string;

  @IsNumber()
  start!: number;

  @IsNumber()
  end!: number;
}
