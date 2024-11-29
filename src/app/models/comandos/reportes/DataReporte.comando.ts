export class DataReporteComando {
    columas: string[];
    datos: any[];
    constructor(
        columnas?: string[],
        datos?: any[],
    ) {
        this.columas = columnas!;
        this.datos = datos!;
    }
}
