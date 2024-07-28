import {Provincia} from "./provincia.model";

export class Localidad {
  id: number;
  nombre: string;
  codigoPostal: string;
  provincia: Provincia;

  constructor(id: number, nombre?: string, provincia?: Provincia, codigoPostal?: string) {
    this.id = id;
    this.nombre = nombre!;
    this.provincia = provincia!;
    this.codigoPostal = codigoPostal!;
  }
}
