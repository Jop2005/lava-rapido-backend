// src/domain/cliente/edad.utils.ts

/**
 * Calcula la edad exacta en años a partir de una fecha de nacimiento
 * Considera el mes y el día para el cálculo correcto
 */
export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();
  const mesNacimiento = fechaNacimiento.getMonth();
  const diaNacimiento = fechaNacimiento.getDate();

  // Aún no ha cumplido años este año
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
    edad--;
  }

  return edad;
}

/**
 * Verifica si una persona es mayor de edad (18 años o más)
 */
export function esMayorDeEdad(fechaNacimiento: Date): boolean {
  return calcularEdad(fechaNacimiento) >= 18;
}

/**
 * Verifica si una persona es menor de edad (menos de 18 años)
 */
export function esMenorDeEdad(fechaNacimiento: Date): boolean {
  return !esMayorDeEdad(fechaNacimiento);
}