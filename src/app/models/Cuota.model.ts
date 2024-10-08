export class Cuota {
  id: number;
  nombre: string;
  cantidadCuotas: number;

  constructor(id?: number, nombre?: string, cantidadCuotas?: number) {
    this.id = id!;
    this.nombre = nombre!;
    this.cantidadCuotas = cantidadCuotas!;
  }
}
