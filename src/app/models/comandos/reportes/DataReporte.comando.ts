export class DataReporteComando {
    columa: string;
    datos: any[];
    constructor(
        columna: string,
        datos?: any[],
    ) {
        this.columa = columna!;
        this.datos = datos!;
    }
}
