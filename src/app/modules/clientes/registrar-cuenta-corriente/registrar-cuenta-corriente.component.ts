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

    // Mapa para almacenar los pagos asociados a cada venta (idVenta)
    const pagosPorVenta = new Map<number, number>();

    // Recorrer los movimientos para llenar el mapa de pagos
    this.movimientosCuentaCorriente.forEach((movimiento) => {

      if (movimiento.idTipoMovimientoCuentaCorriente == this.getTiposMovimientosCuentaCorrienteEnum.PAGO) {
        const montoPago = Number(movimiento.monto) || 0;

        // Almacenar el pago en el mapa, sumando si ya existe un pago previo para la misma venta
        const montoExistente = pagosPorVenta.get(movimiento.idVenta) || 0;
        pagosPorVenta.set(movimiento.idVenta, montoExistente + montoPago);

        // Los pagos del cliente, además, se suman al haber.
        haber += montoPago;
      }
    });

    // Recorrer los movimientos para calcular el balance
    this.movimientosCuentaCorriente.forEach((movimiento) => {
      switch (movimiento.idTipoMovimientoCuentaCorriente) {
        case this.getTiposMovimientosCuentaCorrienteEnum.VENTA:

          const montoVenta = Number(movimiento.monto) || 0;

          // Las ventas del cliente se suman al debe.
          debe += montoVenta;
          break;

        case this.getTiposMovimientosCuentaCorrienteEnum.ANULACION_TOTAL:

          const montoAnulacion = Number(movimiento.monto) || 0;

          // Las anulaciones totales se restan al debe (la deuda ya no existe)
          debe -= montoAnulacion;

          // Si el cliente había hecho pagos para esa venta, se devuelve el efectivo (por lo que los pagos dejan de existir y se restan del haber)
          const montoPagoTotal = pagosPorVenta.get(movimiento.idVenta);
          if (montoPagoTotal !== undefined) {
            haber -= montoPagoTotal;
          }
          break;

        case this.getTiposMovimientosCuentaCorrienteEnum.ANULACION_PARCIAL:

          const montoAnulacionParcial = Number(movimiento.monto) || 0;

          // Las anulaciones parciales se restan al debe (disminuyen la deuda).
          debe -= montoAnulacionParcial;

          let montoPagoParcial: number = 0;

          // Consultar los pagos asociados a esta venta en el mapa
          const montoExistenteParcial = pagosPorVenta.get(movimiento.idVenta);
          if (montoExistenteParcial !== undefined) {
            montoPagoParcial = montoExistenteParcial;
          }

          // Existen pagos, tenemos que ver si los devolvemos o no.
          if (montoPagoParcial && montoPagoParcial > 0) {
            if (montoPagoParcial > montoAnulacionParcial) {
              // Si los pagos son mayores al monto de la anulación, se devuelve solo el excedente de lo que pagó.
              haber -= montoPagoParcial - montoAnulacionParcial;
            } else {
              // Si los pagos son menores al monto de la anulación, se devuelve lo que pagó en su totalidad.
              haber -= montoPagoParcial;
            }
          }
          break;
      }
    });

    // Calcular el saldo final
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
