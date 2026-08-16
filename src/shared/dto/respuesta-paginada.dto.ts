export class MetaPaginacionDto {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export class RespuestaPaginadaDto<T> {
  data: T[];
  meta: MetaPaginacionDto;
}