import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {FiltrosPedidos} from "../../../models/comandos/FiltrosPedidos.comando";
import {Proveedor} from "../../../models/proveedores.model";
import {ProveedoresService} from "../../../services/proveedores.service";
import {Pedido} from "../../../models/pedido.model";
import {RegistrarPedidoComponent} from "../registrar-pedido/registrar-pedido.component";
import {PedidosService} from "../../../services/pedidos.service";
import {TDocumentDefinitions} from "pdfmake/interfaces";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {Configuracion} from "../../../models/configuracion.model";
import {ConfiguracionesService} from "../../../services/configuraciones.service";
import {Producto} from "../../../models/producto.model";
import {ProductosService} from "../../../services/productos.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";

@Component({
  selector: 'app-consultar-pedidos',
  templateUrl: './consultar-pedidos.component.html',
  styleUrl: './consultar-pedidos.component.scss'
})
export class ConsultarPedidosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public tableDataSource: MatTableDataSource<Pedido> = new MatTableDataSource<Pedido>([]);
  public form: FormGroup;

  public pedidos: Pedido[] = [];
  public productos: Producto[] = [];
  public listaProveedor: Proveedor[] = [];
  public configuracion: Configuracion = new Configuracion();
  public columnas: string[] = ['numeroPedido', "proveedor", 'fechaEmision', 'total', 'estado', 'acciones'];

  private filtros: FiltrosPedidos;

  private formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  });

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private pedidosService: PedidosService,
    private proveedoresService: ProveedoresService,
    private configuracionesService: ConfiguracionesService,
    private productosService: ProductosService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosPedidos();
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProveedores();
    this.buscarConfiguraciones();
    this.buscarProductos();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txPedido: ['', []],
      txProveedor: ['', []],
      txFechaEmision: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros = {
      pedido: this.txPedido.value,
      proveedor: this.txProveedor.value,
      fechaEmision: this.txFechaEmision.value
    };

    this.pedidosService.consultarPedidos(this.filtros).subscribe((pedidos) => {
      this.pedidos = pedidos;
      this.tableDataSource.data = pedidos;
    });
  }

  public buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedor = proveedores;
    });
  }

  public buscarProductos() {
    this.productosService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      this.productos = productos;
    });
  }

  public registrarNuevoPedido() {
    this.dialog.open(
      RegistrarPedidoComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    )
  }

  public verPedido(pedido: Pedido, editar: boolean) {
    this.dialog.open(
      RegistrarPedidoComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          pedido: pedido,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    )
  }

  public eliminarPedido(idPedido: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar la orden de compra?', 'Eliminar Orden de Compra') //Está seguro?
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.pedidosService.eliminarPedido(idPedido).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Pedido eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el pedido');
            }
          });
        }
      });
  }

  public imprimirPedido(pedido: Pedido) {

    this.notificationDialogService.confirmation(`¿Desea imprimir la orden de compra?
      Recuerde cargar sus datos
      en la configuración.`, 'Imprimir Orden de Compra')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.imprimir(pedido, this.productos);
        }
      });
  }

  public imprimir(pedido: Pedido, productos: Producto[]) {
    const total = this.formatter.format(pedido.total);
    const subtotalNoFormat = pedido.detallePedido?.reduce((acc, detalle) => acc + (Number(detalle.subTotal) || 0), 0) || 0;
    const subtotal = this.formatter.format(subtotalNoFormat);
    const impuesto = this.formatter.format((subtotalNoFormat * pedido.impuesto / 100));
    const descuento = this.formatter.format((-subtotalNoFormat * pedido.descuento / 100));
    const montoEnvio = this.formatter.format(pedido.montoEnvio);
    const fechaPedido = new Date(pedido.fechaPedido).toLocaleDateString('es-AR');
    const fechaEntrega = new Date(pedido.fechaEntrega).toLocaleDateString('es-AR');
    const calleNumeroProveedor: string = `${pedido.proveedor.domicilio.calle} ${pedido.proveedor.domicilio.numero}`
    const ciudadCpProveedor: string = `${pedido.proveedor.domicilio.localidad.nombre}, ${pedido.proveedor.domicilio.localidad.provincia.nombre}, ${pedido.proveedor.domicilio.localidad.codigoPostal}`

    const docDefinition: TDocumentDefinitions = {
      content: [
        // Encabezado
        {
          columns: [
            {
              image: `${this.configuracion.logo}`,
              width: 60
            },

            {
              stack: [
                {
                  text: 'ORDEN DE COMPRA',
                  style: 'invoiceTitle'
                },
                {
                  stack: [
                    {
                      columns: [
                        {
                          text: 'Orden #',
                          style: 'invoiceSubTitle',
                          width: '*'
                        },
                        {
                          text: `${pedido.id}`,
                          style: 'invoiceSubValue',
                          width: 100
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: 'Fecha Emisión',
                          style: 'invoiceSubTitle',
                          width: '*'
                        },
                        {
                          text: fechaPedido,
                          style: 'invoiceSubValue',
                          width: 100
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: 'Fecha Entrega',
                          style: 'invoiceSubTitle',
                          width: '*'
                        },
                        {
                          text: fechaEntrega,
                          style: 'invoiceSubValue',
                          width: 100
                        }
                      ]
                    }
                  ],
                }
              ],
            }
          ]
        },
        {
          stack: [
            {
              text: `${this.configuracion.razonSocial}\n${this.configuracion.calle} ${this.configuracion.numero}\n${this.configuracion.ciudad} ${this.configuracion.codigoPostal}\nArgentina`,
              style: 'companyDetails',
            }
          ],
        },
        {
          columns: [
            {
              text: 'VENDEDOR',
              style: 'invoiceBillingTitle'
            },
            {
              text: 'ENVIAR A',
              style: 'invoiceBillingTitle'
            }
          ]
        },
        {
          columns: [
            {
              text: pedido.proveedor.nombre,
              style: 'invoiceBillingDetails'
            },
            {
              text: this.configuracion.razonSocial,
              style: 'invoiceBillingDetails'
            }
          ]
        },
        {
          columns: [
            {
              text: 'Dirección',
              style: 'invoiceBillingAddressTitle'
            },
            {
              text: 'Dirección',
              style: 'invoiceBillingAddressTitle'
            }
          ]
        },
        {
          columns: [
            {
              text: `${calleNumeroProveedor} \n ${ciudadCpProveedor} \n Argentina`,
              style: 'invoiceBillingAddress'
            },
            {
              text: `${this.configuracion.calle} ${this.configuracion.numero}\n${this.configuracion.ciudad}, ${this.configuracion.provincia}, ${this.configuracion.codigoPostal}\nArgentina`,
              style: 'invoiceBillingAddress'
            }
          ]
        },
        '\n\n',
        {
          table: {
            headerRows: 1,
            widths: ['*', 50, 'auto', 80],
            body: [
              // Encabezado de la tabla
              [
                { text: 'Producto', style: 'itemsHeader' },
                { text: 'Cantidad', style: ['itemsHeader', 'center'] },
                { text: 'Precio', style: ['itemsHeader', 'center'] },
                { text: 'Total', style: ['itemsHeader', 'center'] }
              ],
              // Items
              ...pedido.detallePedido.map(detalle => {
                const producto = productos.find(p => p.id === detalle.idproducto);
                return [
                  {
                    stack: [
                      { text: producto?.nombre || 'Producto no encontrado', style: 'itemTitle' },
                      { text: producto?.descripcion || 'Sin descripción', style: 'itemSubTitle' }
                    ]
                  },
                  { text: detalle.cantidad.toString(), style: 'itemNumber' },
                  { text: this.formatter.format(detalle.subTotal / detalle.cantidad), style: 'itemNumber' },
                  { text: this.formatter.format(detalle.subTotal), style: 'itemTotal' }
                ];
              })
            ]
          }
        },
        {
          table: {
            headerRows: 0,
            widths: ['*', 80],
            body: [
              // Total
              [
                { text: 'Subtotal', style: 'itemsFooterSubTitle' },
                { text: subtotal, style: 'itemsFooterSubValue' }
              ],
              [
                { text: 'Costo de envío', style: 'itemsFooterSubTitle' },
                { text: montoEnvio, style: 'itemsFooterSubValue' }
              ],
              [
                { text: `Impuestos (${pedido.impuesto.toString()}%)`, style: 'itemsFooterSubTitle' },
                { text: impuesto, style: 'itemsFooterSubValue' }
              ],
              [
                { text: `Descuento (${pedido.descuento.toString()}%)`, style: 'itemsFooterSubTitle' },
                { text: descuento, style: 'itemsFooterSubValue' }
              ],
              [
                { text: 'TOTAL', style: 'itemsFooterTotalTitle' },
                { text: total, style: 'itemsFooterTotalValue' }
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          columns: [
            {
              text:'',
            },
            {
              stack: [
                {
                  text: '_________________________________',
                  style: 'signaturePlaceholder'
                },
                {
                  text: 'Firma',
                  style: 'signatureName'
                }
              ],
              width: 180,
            },
          ]
        },
        {
          text: 'OBSERVACIONES',
          style: 'notesTitle'
        },
        {
          text: pedido.observaciones,
          style: 'notesText'
        }
      ],
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
          margin: [5, 5, 5, 5],
          alignment: 'right'
        },
        companyDetails: {
          fontSize: 12,
          margin: [0, 10, 0, 10],
          alignment: 'left'
        },
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'right',
          margin: [0, 0, 0, 15]
        },
        invoiceSubTitle: {
          fontSize: 12,
          alignment: 'right'
        },
        invoiceSubValue: {
          fontSize: 12,
          alignment: 'right'
        },
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 5]
        },
        invoiceBillingDetails: {
          alignment: 'left'
        },
        invoiceBillingAddressTitle: {
          margin: [0, 7, 0, 3],
          bold: true
        },
        invoiceBillingAddress: {
        },
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
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
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

  private async buscarConfiguraciones() {
    this.configuracionesService.consultarConfiguraciones().subscribe((configuracion) => {
      this.configuracion = configuracion;
    });
  }

  // Regios getters
  get txPedido(): FormControl {
    return this.form.get('txPedido') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }

  get txFechaEmision(): FormControl {
    return this.form.get('txFechaEmision') as FormControl;
  }

}
