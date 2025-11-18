import { IsString, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsNumber()
  idx!: number;

  @IsString()
  start!: string;

  @IsString()
  end!: string;

  @IsString()
  text!: string;
}
