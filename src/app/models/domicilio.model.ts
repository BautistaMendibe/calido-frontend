import { Localidad } from "./localidad.model";

export class Domicilio {
  id: string;
  calle: string;
  numero: number;
  localidad: Localidad;

  constructor(
    id?: string,
    calle?: string,
    numero?: number,
    localidadId?: number
  ) {
    this.id = id!;
    this.calle = calle!;
    this.numero = numero!;

    // Crear una nueva instancia de Localidad
    const localidad = new Localidad(localidadId!);

    this.localidad = localidad;
  }
}
