import { IsString, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsNumber()
  idx!: number;

  @IsNumber()
  start!: number;

  @IsNumber()
  end!: number;

  @IsString()
  text!: string;
}
