import { IsString, IsInt, Min } from 'class-validator';

export class LineaSolicitudDto {
  @IsString()
  tipoPrenda: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}