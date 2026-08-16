export class TipoPrenda {
  constructor(
    public readonly tipo: string,
  ) {}

  // Validar que el tipo no esté vacío
  esValido(): boolean {
    return this.tipo && this.tipo.trim().length > 0;
  }

  // Normalizar el tipo (capitalizar primera letra)
  normalizar(): string {
    return this.tipo.charAt(0).toUpperCase() + this.tipo.slice(1).toLowerCase();
  }
}