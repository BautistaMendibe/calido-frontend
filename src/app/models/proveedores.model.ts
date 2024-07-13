import {Domicilio} from "./domicilio.model";
import {TipoProveedor} from "./tipoProveedor.model";

export class Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  domicilio: Domicilio;
  email: string;
  cuit: string;
  tipo: TipoProveedor;
  //direccion: string;

  constructor(
    id?: number,
    nombre?: string,
    telefono?: string,
    domicilio?: Domicilio,
    email?: string,
    cuit?: string,
    tipo?: TipoProveedor
  ) {
    this.id = id!;
    this.nombre = nombre!;
    this.telefono = telefono!;
    this.domicilio = domicilio!;
    this.email = email!;
    this.cuit = cuit!;
    this.tipo = tipo!;
  }
}
