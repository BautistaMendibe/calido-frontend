export class Localidad {
  id: number;
  nombre: string;
  idProvincia: number;
  codigoPostal: string;

  constructor(id: number, nombre?: string, idProvincia?: number, codigoPostal?: string) {
    this.id = id;
    this.nombre = nombre!;
    this.idProvincia = idProvincia!;
    this.codigoPostal = codigoPostal!;
  }
}
