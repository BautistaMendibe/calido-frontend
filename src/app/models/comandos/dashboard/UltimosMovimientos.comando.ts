export class UltimosMovimientosComando {
  id: number;
  nombre: string;
  codigo: number;
  costo: number;
  fecha: Date;
  icono: string;
  usuario: string;

  constructor(nombre?: string, id?: number, codigo?:number, costo?: number, fecha?: Date, icono?: string, usuario?: string) {
    this.nombre = nombre!;
    this.id = id!;
    this.codigo = codigo!;
    this.costo = costo!;
    this.fecha = fecha!;
    this.icono = icono!;
    this.usuario = usuario!;
  }
}
