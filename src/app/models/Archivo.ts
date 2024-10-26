export class Archivo {
  id: number;
  nombre: string;
  ruta: string;
  fechaSubida: Date;
  tipo: string;
  tamano: number;

  constructor(id?: number, nombre?: string, ruta?: string, fechaSubida?: Date, tipo?: string, tamano?: number) {
    this.id = id!;
    this.nombre = nombre!;
    this.ruta = ruta!;
    this.fechaSubida = fechaSubida!;
    this.tipo = tipo!;
    this.tamano = tamano!;
  }
}
