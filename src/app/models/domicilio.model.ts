import {Provincia} from "./provincia.model";

export class Domicilio {
  id: string;
  calle: string;
  numero: number;
  provincia: Provincia;

  constructor(
    id?: string,
    calle?: string,
    numero?: number,
    provincia?: Provincia,
  ) {
    this.id = id!;
    this.calle = calle!;
    this.numero = numero!;
    this.provincia = provincia!;
  }
}
