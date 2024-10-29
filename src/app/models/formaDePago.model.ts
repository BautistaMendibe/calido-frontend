export class FormaDePago {
  id: number;
  nombre: string;
  idAfip: number;

  constructor(id?: number, nombre?: string, idAfip?: number) {
    this.id = id!;
    this.nombre = nombre!;
    this.idAfip = idAfip!;
  }
}
