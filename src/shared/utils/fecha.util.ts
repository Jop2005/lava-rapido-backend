// src/shared/utils/fecha.util.ts

export class FechaUtil {
  private static readonly ZONA_OFFSET = -4 * 60; // UTC-4 (Bolivia/Cuba)

  /**
   * Convierte una fecha UTC a fecha local (Bolivia/Cuba)
   */
  static toLocal(fechaUTC: Date): Date {
    return new Date(fechaUTC.getTime() + this.ZONA_OFFSET * 60000);
  }

  /**
   * Convierte una fecha local a UTC
   */
  static toUTC(fechaLocal: Date): Date {
    return new Date(fechaLocal.getTime() - this.ZONA_OFFSET * 60000);
  }

  /**
   * Obtiene el inicio del día en zona local
   */
  static inicioDelDiaLocal(): Date {
    const ahora = new Date();
    const fechaLocal = this.toLocal(ahora);
    fechaLocal.setHours(0, 0, 0, 0);
    return this.toUTC(fechaLocal);
  }

  /**
   * Formatea fecha a YYYY-MM-DD en zona local
   */
  static formatearLocal(fecha: Date): string {
    const fechaLocal = this.toLocal(fecha);
    return fechaLocal.toISOString().split('T')[0];
  }

  /**
   * Obtiene los últimos N días en zona local
   */
  static obtenerUltimosNDias(n: number): string[] {
    const hoy = this.inicioDelDiaLocal();
    const dias: string[] = [];

    for (let i = n - 1; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      dias.push(this.formatearLocal(fecha));
    }

    return dias;
  }
}