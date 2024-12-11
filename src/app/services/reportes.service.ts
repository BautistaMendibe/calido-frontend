import {Injectable} from "@angular/core";
import {environmentDEV} from "../../environments/environment-dev";
import {HttpClient} from "@angular/common/http";
import {ReporteComando} from "../models/comandos/reportes/Reporte.comando";
import {Observable} from "rxjs";
import {DataReporteComando} from "../models/comandos/reportes/DataReporte.comando";
import {TDocumentDefinitions} from "pdfmake/interfaces";
import pdfMake from "pdfmake/build/pdfmake";
import {Configuracion} from "../models/configuracion.model";


@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'reportes';

  constructor(private http: HttpClient) {
  }

  public obtenerDataReporte(reporte: ReporteComando): Observable<DataReporteComando[]> {
    return this.http.post<DataReporteComando[]>(`${this.urlBackend}/${this.controllerName}/obtener-data-reporte`, reporte);
  }


  public generarPDF(reporte: ReporteComando, configuracion: Configuracion) {
    const fechaEmision = new Date().toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });


    const docDefinition: TDocumentDefinitions = {
      content: [
        // Encabezado
        {
          columns: [
            {
              image: `${configuracion.logo ? configuracion.logo : ''}`,
              width: 40
            },
            {
              stack: [
                {
                  text: `${configuracion.razonSocial}\n${configuracion.calle} ${configuracion.numero}\n${configuracion.ciudad}, ${configuracion.provincia}, ${configuracion.codigoPostal}\nArgentina`,
                  style: 'companyDetails',
                }
              ],
            },
          ]
        },

        {
          columns: [
            {
              stack: [
                {
                  text: reporte.nombre,
                  style: 'invoiceTitle'
                },
                {
                  stack: [
                    {
                      columns: [
                        {
                          text: 'Fecha desde',
                          style: 'invoiceSubTitle',
                          width: 80
                        },
                        {
                          text: reporte.filtros.fechaDesde ? reporte.filtros.fechaDesde.toLocaleDateString() : '-',
                          style: 'invoiceSubValue',
                          width: '*'
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: 'Fecha hasta',
                          style: 'invoiceSubTitle',
                          width: 80
                        },
                        {
                          text: reporte.filtros.fechaHasta ? reporte.filtros.fechaHasta.toLocaleDateString() : '-',
                          style: 'invoiceSubValue',
                          width: '*'
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: 'Fecha emisión',
                          style: 'invoiceSubTitle',
                          width: 80
                        },
                        {
                          text: fechaEmision,
                          style: 'invoiceSubValue',
                          width: '*'
                        },
                      ],
                    },
                  ],
                }
              ],
            }
          ]
        },

        '\n',

        {
          table: {
            headerRows: 1,
            widths: Array(reporte.columnas.length).fill('*'), // Ajusta los anchos según el número de columnas y contenido
            body: [
              // Encabezado de la tabla
              [
                ...reporte.columnas.map((columna) => ({
                  text: columna,
                  style: ['itemsHeader', 'center'],
                })),
              ],
              // Cuerpo de la tabla (filas de datos)
              ...reporte.data.map((dato: any) => {
                const fila = Array.isArray(dato) ? dato : Object.values(dato);
                return fila.map((datosReporte: any) => ({
                  text: datosReporte || '',
                  style: 'itemNumber',
                }));
              }),
            ],
          },
        },

        '\n',

        {
          columns: reporte.imagenGrafico
            ? [
              {
                image: reporte.imagenGrafico, // Solo se incluye si imagenGrafico tiene valor
                width: 500,
                alignment: 'center',
              },
            ]
            : [], // Si no hay imagen, se devuelve un arreglo vacío
        },
      ],
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            {
              text: `Página ${currentPage} de ${pageCount}`,
              style: 'documentFooterRight'
            }
          ]
        };
      },
      styles: {
        documentHeaderLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left'
        },
        documentHeaderCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center'
        },
        documentHeaderRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'right'
        },
        documentFooterLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left'
        },
        documentFooterCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center'
        },
        documentFooterRight: {
          fontSize: 10,
          margin: [5, 5, 40, 5],
          alignment: 'right'
        },
        companyDetails: {
          fontSize: 11,
          margin: [0, 0, 0, 0],
          alignment: 'left'
        },
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 10]
        },
        invoiceSubTitle: {
          fontSize: 10,
          alignment: 'left'
        },
        invoiceSubValue: {
          fontSize: 10,
          alignment: 'left'
        },
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 0]
        },
        invoiceBillingDetails: {
          alignment: 'left'
        },
        invoiceBillingAddressTitle: {
          margin: [0, 7, 0, 3],
          bold: true
        },
        invoiceBillingAddress: {},
        itemsHeader: {
          margin: [0, 5, 0, 5],
          bold: true
        },
        itemTitle: {
          bold: true
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11
        },
        itemNumber: {
          margin: [0, 5, 0, 5],
          alignment: 'center'
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center'
        },
        itemsFooterSubTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right'
        },
        itemsFooterSubValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center'
        },
        itemsFooterTotalTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right'
        },
        itemsFooterTotalValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center'
        },
        signaturePlaceholder: {
          margin: [0, 70, 0, 0]
        },
        signatureName: {
          bold: true,
          alignment: 'center'
        },
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 30, 0, 3]
        },
        notesText: {
          fontSize: 10
        },
        center: {
          alignment: 'center'
        }
      },
      defaultStyle: {
        columnGap: 20
      }
    };

    const win = window.open('', '_blank');
    pdfMake.createPdf(docDefinition).open({}, win);
  }


}
