export class TipoFactura {
  id: number;
  nombre: string | undefined;

  constructor(id?: number, nombre?: string) {
    this.id = id!;
    this.nombre = nombre!;
  }
}
