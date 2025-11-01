import { IsString, IsNumber } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name!: string; // оператор ! говорит TS: "я точно знаю, что это поле будет установлено"

  @IsNumber()
  start!: number;

  @IsNumber()
  end!: number;
}
