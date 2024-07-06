import {Domicilio} from "./domicilio.model";

export class Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  domicilio: Domicilio;
  email: string;
  cuit: string;

  constructor(
    id?: number,
    nombre?: string,
    telefono?: string,
    domicilio?: Domicilio,
    email?: string,
    cuit?: string
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.telefono = telefono!;
    this.domicilio = domicilio!;
    this.email = email!;
    this.cuit = cuit!;
  }
}
