export class Motivo {
  id: number;
  nombre: string | undefined;

  constructor(id?: number, nombre?: string) {
    this.id = id!;
    this.nombre = nombre!;
  }
}
