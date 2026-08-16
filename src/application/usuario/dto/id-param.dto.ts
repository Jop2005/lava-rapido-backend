import { IsString, Length, Matches } from 'class-validator';

export class IdParamDto {
  @IsString()
  @Length(11, 11, { message: 'La cédula debe tener exactamente 11 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'La cédula solo debe contener números' })
  id: string;
}