export class DataReporteComando {
    columna: string;
    datos: any[];
    constructor(
        columna: string,
        datos?: any[],
    ) {
        this.columna = columna!;
        this.datos = datos!;
    }
}
