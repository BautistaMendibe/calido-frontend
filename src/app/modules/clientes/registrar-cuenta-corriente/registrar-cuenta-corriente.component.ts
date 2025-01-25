import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {
  ConsultarCuentasCorrientesComponent
} from "../consultar-cuentas-corrientes/consultar-cuentas-corrientes.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {MatTableDataSource} from "@angular/material/table";
import {VentasService} from "../../../services/ventas.services";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {NotificationService} from "../../../services/notificacion.service";
import {ThemeCalidoService} from "../../../services/theme.service";
import {MovimientoCuentaCorriente} from "../../../models/movimientoCuentaCorriente";
import {FiltrosMovimientosCuentaCorriente} from "../../../models/comandos/FiltrosMovimientosCuentaCorriente.comando";
import {PagarCuentaCorrienteComponent} from "../pagar-cuenta-corriente/pagar-cuenta-corriente.component";
import {TiposMovimientoCuentaCorrienteEnum} from "../../../shared/enums/tipo-movimiento-cuenta-corriente.enum";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {TDocumentDefinitions} from "pdfmake/interfaces";
import {ConfiguracionesService} from "../../../services/configuraciones.service";
import {Configuracion} from "../../../models/configuracion.model";

@Component({
  selector: 'app-registrar-cuenta-corriente',
  templateUrl: './registrar-cuenta-corriente.component.html',
  styleUrls: ['./registrar-cuenta-corriente.component.scss']
})
export class RegistrarCuentaCorrienteComponent implements OnInit {

  public form: FormGroup;
  public listaClientes: Usuario[] = [];
  public esConsulta: boolean;
  public esRegistro: boolean;
  public formDesactivado: boolean;
  private referencia: ConsultarCuentasCorrientesComponent;
  public fechaHoy: Date = new Date();

  public isLoading: boolean = false;
  public darkMode: boolean = false;

  private configuracion: Configuracion = new Configuracion();

  public tableDataSourceMovimientos: MatTableDataSource<MovimientoCuentaCorriente> = new MatTableDataSource<MovimientoCuentaCorriente>([]);
  public movimientosCuentaCorriente: MovimientoCuentaCorriente[] = [];
  public columnasMovimientos: string[] = ['fecha', 'tipoMovimientoCuentaCorriente', 'comprobante', 'idVenta', 'monto', 'formaDePago', 'acciones']
  public listaMovimientosDeshabilitada: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginatorMovimientos!: MatPaginator;
  @ViewChild(MatSort) sortMovimientos!: MatSort;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    private dialogRef: MatDialogRef<RegistrarCuentaCorrienteComponent>,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private dialog: MatDialog,
    private notificationDialogService: NotificationService,
    private themeService: ThemeCalidoService,
    private configuracionesService: ConfiguracionesService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarCuentasCorrientesComponent;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      cuentaCorriente: CuentaCorriente;
      esRegistro: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.esConsulta = this.data.esConsulta;
    this.esRegistro = this.data.esRegistro;
    this.formDesactivado = this.data.formDesactivado;
    this.referencia = this.data.referencia;
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();

    if (this.data.formDesactivado) {
      this.form.disable();
    }

    this.txBalance.disable();
    this.txDebe.disable();
    this.txHaber.disable();

    if (this.data.editar) {
      this.listaMovimientosDeshabilitada = false;
      this.txCreada.disable();
      this.txCliente.disable();
    }

    this.buscarUsuarios();
    this.buscarConfiguraciones();
    this.filtrosSuscripciones();

    if (this.esConsulta || this.data.editar) {
      const idUsuario = this.data.cuentaCorriente.idUsuario;
      this.buscarMovimientosCuentaCorriente(idUsuario);
    }

    this.txCliente.valueChanges.subscribe(() => { this.buscarMovimientosCuentaCorriente(this.txCliente.value); this.calcularBalance(); });
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txCliente: [this.data.cuentaCorriente?.usuario?.id || '', [Validators.required]],
      txCreada: [this.data.cuentaCorriente?.fechaDesde || new Date(), [Validators.required]],
      txBalance: ['', [Validators.required]],
      txDebe: [''],
      txHaber: [''],
      txBuscar: ['']
    });
  }

  private buscarUsuarios() {
    this.usuarioService.consultarClientes(new FiltrosEmpleados()).subscribe((clientes) => {
      this.listaClientes = clientes.filter(cliente => cliente.id !== -1); // Sacar el consumidor final
    });
  }

  public buscarMovimientosCuentaCorriente(idUsuario: number) {
    const filtro = new FiltrosMovimientosCuentaCorriente();
    filtro.idUsuario = idUsuario;

    this.usuarioService.consultarMovimientosCuentaCorriente(filtro).subscribe((movimientos) => {
      this.movimientosCuentaCorriente = movimientos;
      this.tableDataSourceMovimientos.data = movimientos;
      this.tableDataSourceMovimientos.paginator = this.paginatorMovimientos;
      this.tableDataSourceMovimientos.sort = this.sortMovimientos;

      this.calcularBalance();
      this.isLoading = false;
    });
  }

  private calcularBalance() {
    let debe = 0;
    let haber = 0;

    this.movimientosCuentaCorriente.forEach((movimiento) => {

      // CASO 1: El movimiento es una venta realizada a la cuenta corriente del cliente (factura)
      if (movimiento.idTipoMovimientoCuentaCorriente == this.getTiposMovimientosCuentaCorrienteEnum.VENTA) {
        const montoVenta = Number(movimiento.monto) || 0;

        // Las ventas del cliente se suman al debe.
        debe += montoVenta;
        return;
      }

      // CASO 2: El movimiento es un pago que hizo el cliente a una venta de su cuenta corriente
      if (movimiento.idTipoMovimientoCuentaCorriente == this.getTiposMovimientosCuentaCorrienteEnum.PAGO) {
        const montoPago = Number(movimiento.monto) || 0;

        // Los pagos del cliente se suman al haber.
        haber += montoPago;
        return;
      }

      // CASO 3: El movimiento es una anulación de una venta de la cuenta corriente del cliente (nota de crédito)
      if (movimiento.idTipoMovimientoCuentaCorriente == (this.getTiposMovimientosCuentaCorrienteEnum.ANULACION_TOTAL || this.getTiposMovimientosCuentaCorrienteEnum.ANULACION_PARCIAL)) {
        const montoAnulacion = Number(movimiento.monto) || 0;

        // Las anulaciones se suman al haber.
        haber += montoAnulacion;
        return;
      }

      // CASO 4: El movimiento es una devolución de un pago
      if (movimiento.idTipoMovimientoCuentaCorriente == (this.getTiposMovimientosCuentaCorrienteEnum.DEVOLUCION_DE_PAGO)) {
        const montoDevolucion = Number(movimiento.monto) || 0;

        // Las devoluciones se restan del haber.
        haber -= montoDevolucion;
        return;
      }
    });

    const saldo: number = debe - haber;
    this.txDebe.setValue(debe);
    this.txHaber.setValue(haber);
    this.txBalance.setValue(saldo);
  }

  public registrarCuentaCorriente() {
    if (this.form.valid) {
      const cuentaCorriente = this.construirCuentaCorriente();
      this.usuarioService.registrarCuentaCorriente(cuentaCorriente).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La cuenta corriente se registró con éxito');
      });
    }
  }

  public modificarCuentaCorriente() {
    if (this.form.valid) {
      const cuentaCorriente = this.construirCuentaCorriente(this.data.cuentaCorriente?.id);
      this.usuarioService.modificarCuentaCorriente(cuentaCorriente).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La cuenta corriente se modificó con éxito');
        this.referencia.buscar();
      });
    }
  }

  private construirCuentaCorriente(id?: number): any {
    return {
      id: id || undefined,
      usuario: {id: this.txCliente.value},
      fechaDesde: this.txCreada.value,
      balanceTotal: parseFloat(this.txBalance.value) || 0
    } as CuentaCorriente;
  }

  private gestionarRespuesta(respuesta: any, mensajeExito: string) {
    if (respuesta.mensaje === 'OK') {
      this.notificacionService.openSnackBarSuccess(mensajeExito);
      this.dialogRef.close(respuesta);
    } else {
      this.notificacionService.openSnackBarError(respuesta.mensaje);
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public habilitarEdicion(){
    this.txBuscar.enable();
    this.formDesactivado = false;
    this.data.editar = true;
  }

  private filtrosSuscripciones() {
    // Filtrar movimientos por ID de venta.
    this.txBuscar.valueChanges.subscribe((valor) => {
      this.tableDataSourceMovimientos.filter = valor.trim();
    });

    this.tableDataSourceMovimientos.filterPredicate = (data: MovimientoCuentaCorriente, filter: string): boolean => {
      const nroVenta = data.idVenta?.toString() || '';
      return nroVenta.includes(filter);
    };
  }

  public registrarMovimiento(movimiento: MovimientoCuentaCorriente) {
    const dialog = this.dialog.open(
      PagarCuentaCorrienteComponent,
      {
        width: '75%',
        height: 'auto',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          referencia: this,
          movimiento: movimiento,
          cuentaCorriente: this.data.cuentaCorriente
        }
      }
    );

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.buscarMovimientosCuentaCorriente(this.data.cuentaCorriente.idUsuario);
      }
    });
  }

  public eliminarMovimiento(idMovimiento: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar este pago?', 'Eliminar Pago')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuarioService.eliminarMovimientoCuentaCorriente(idMovimiento).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Pago de cuenta corriente eliminado con éxito');
              this.buscarMovimientosCuentaCorriente(this.data.cuentaCorriente.idUsuario);
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar pago de cuenta corriente');
            }
          });
        }
      });
  }

  public imprimirComprobanteDePago(movimiento: MovimientoCuentaCorriente) {
    this.notificationDialogService.confirmation(`¿Desea imprimir el comprobante de pago?
      Recuerde cargar sus datos
      en la configuración.`, 'Imprimir Comprobante de Pago')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.imprimir(movimiento);
        }
      });
  }

  public imprimir(movimiento: MovimientoCuentaCorriente) {
    const docDefinition: TDocumentDefinitions = {
      header: (currentPage, pageCount, pageSize) => {
        return [
          {
            canvas: [
              {
                type: "rect",
                x: 40,
                y: 20,
                w: pageSize.width - 75,
                h: 0,
                lineWidth: 1,
                lineColor: "#a0a0a0",
              },
            ],
          },
        ];
      },
      footer: (currentPage, pageCount, pageSize) => {
        return [
          {
            text: `Gracias por la confianza en ${this.configuracion.razonSocial}`,
            alignment: 'center',
            bold: false,
            fontSize: 18,
            margin: [0, -16, 0, 0]
          },
          {
            canvas: [
              {
                type: "rect",
                x: 40,
                y: 10,
                w: pageSize.width - 75,
                h: 0,
                lineWidth: 1,
                lineColor: "#a0a0a0",
              }
            ],
          }
        ];
      },
      pageSize: "A4",
      pageOrientation: "landscape",
      content: [
        {
          margin: [0, 10],
          layout: "noBorders",
          table: {
            headerRows: 1,
            widths: [60, "*"],
            body: [
              [
                {
                  image: `${this.configuracion.logo}`,
                  width: 60,
                },
                {
                  text: this.configuracion.razonSocial,
                  bold: true,
                  fontSize: 30,
                  alignment: 'left',
                  margin: [15, 20, 0, 0],
                }
              ],
            ]
          },
        },
        {
          margin: [0, 10],
          layout: "noBorders",
          table: {
            headerRows: 1,
            widths: ["*", "*"],
            body: [
              [
                { text: this.configuracion.razonSocial, bold: true, alignment: 'left' },
                { text: new Date(movimiento.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ''), alignment: 'right' }
              ],
              [
                { text: `${this.configuracion.calle} ${this.configuracion.numero}, ${this.configuracion.ciudad}, ${this.configuracion.provincia}, ${this.configuracion.codigoPostal}, Argentina`, alignment: 'left' },
                { text: `Comprobante #: ${movimiento.comprobante}`, alignment: 'right' }
              ]
            ]
          }
        },
        {
          canvas: [
            {
              type: "rect",
              x: 0,
              y: 0,
              w: 760,
              h: 0,
              lineWidth: 1,
              lineColor: "#a0a0a0",
            }
          ]
        },
        // Tabla de precios
        {
          margin: [0, 28, 0, 0],
          table: {
            headerRows: 1,
            widths: ["*", "*"],
            body: [
              [
                {
                  text: "Total abonado:",
                  bold: true,
                  alignment: 'left',
                  fontSize: 18,
                  margin: [0, 8],
                  style: 'tableHeader',
                  borderColor: ["#fff", "#fff", "#fff", "#fff"]
                },
                {
                  text: `$ ${Number(movimiento.monto).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.').replace('.', ',')}`,
                  alignment: 'right',
                  fontSize: 18,
                  margin: [0, 8],
                  style: 'tableHeader',
                  borderColor: ["#fff", "#fff", "#fff", "#fff"]
                }
              ]
            ]
          }
        }
      ]
    };

    const win = window.open('', '_blank');
    pdfMake.createPdf(docDefinition).open({}, win);
  }


  private async buscarConfiguraciones() {
    this.configuracionesService.consultarConfiguraciones().subscribe((configuracion) => {
      this.configuracion = configuracion;
    });
  }

  // Región getters
  get txCliente() {
    return this.form.get('txCliente') as FormControl;
  }

  get txCreada() {
    return this.form.get('txCreada') as FormControl;
  }

  get txDebe() {
    return this.form.get('txDebe') as FormControl;
  }

  get txHaber() {
    return this.form.get('txHaber') as FormControl;
  }

  get txBalance() {
    return this.form.get('txBalance') as FormControl;
  }

  get txBuscar() {
    return this.form.get('txBuscar') as FormControl;
  }

  get getTiposMovimientosCuentaCorrienteEnum(): typeof TiposMovimientoCuentaCorrienteEnum {
    return TiposMovimientoCuentaCorrienteEnum;
  }

  protected readonly Math = Math;
}
