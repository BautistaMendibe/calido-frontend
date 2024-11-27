import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {CajasService} from "../../../services/cajas.service";
import {VentasService} from "../../../services/ventas.services";
import {MatTableDataSource} from "@angular/material/table";
import {Venta} from "../../../models/venta.model";
import {Arqueo} from "../../../models/Arqueo.model";
import {FiltrosArqueos} from "../../../models/comandos/FiltrosArqueos.comando";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FormaDePago} from "../../../models/formaDePago.model";
import {MovimientoManual} from "../../../models/movimientoManual.model";
import {NotificationService} from "../../../services/notificacion.service";

@Component({
  selector: 'app-detalle-arqueo',
  templateUrl: './detalle-arqueo.component.html',
  styleUrl: './detalle-arqueo.component.scss'
})
export class DetalleArqueoComponent implements OnInit {
  public form: FormGroup;
  public idArqueo: string | null = null;
  public arqueo: Arqueo = new Arqueo();
  public formasPago: FormaDePago[] = [];
  public filtradoPorFormasPago: FormaDePago[] = [];
  public ventas: Venta[] = [];
  public isLoading: boolean = false;
  public movimientosManuales: MovimientoManual[] = [];
  public formaPagoDefecto!: number;

  // Totales y diferencias
  public totalCaja: number = 0;
  public totalOtrosMedios: number = 0;
  public diferenciaCaja: number = 0;
  public diferenciaOtrosMedios: number = 0;

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
  public columnas: string[] = ['fecha', 'formaPago', 'descripcion', 'tipoMovimiento', 'montoTotal', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private cajasService: CajasService,
    private ventasService: VentasService,
    private route: ActivatedRoute,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idArqueo = params.get('id');
      this.crearFormulario();
      this.buscarFormasPago();
      this.buscarArqueo();
      this.filtroSuscripciones();
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txTipoMovimiento: ['', [Validators.required]],
      txDescripcion: ['', [Validators.required, Validators.maxLength(200)]],
      txMonto: ['', [Validators.required]],
      txFormaPago: ['', [Validators.required]],
      txCantidadDineroCaja: ['', [Validators.required]],
      txCantidadDineroOtrosMedios: ['', [Validators.required]],
    });
  }

  public buscarFormasPago() {
    this.ventasService.buscarFormasDePago().subscribe((formasPago) => {
      // Asignar las formas de pago recibidas del servicio
      this.formasPago = formasPago.map((forma) => {
        // Agregar el ícono representativo según el ID
        switch (forma.id) {
          case 1: // Efectivo
            forma.icon = 'payments';
            break;
          case 2: // Tarjeta de débito
            forma.icon = 'credit_card';
            break;
          case 3: // Tarjeta de crédito
            forma.icon = 'credit_score';
            break;
          case 4: // Mercado Pago
            forma.icon = 'account_balance_wallet';
            break;
          case 5: // Transferencia
            forma.icon = 'account_balance';
            break;
          case 6: // Cuenta Corriente
            forma.icon = 'receipt';
            break;
          case 7: // QR
            forma.icon = 'qr_code';
            break;
          default:
            forma.icon = 'help';
            break;
        }
        return forma;
      });

      const todas = new FormaDePago();
      todas.id = 0;
      todas.nombre = 'Todas';

      this.filtradoPorFormasPago = [todas, ...this.formasPago]
      this.formaPagoDefecto = todas.id;
    });
  }

  public buscarArqueo() {
    const filtroArqueo: FiltrosArqueos = new FiltrosArqueos();
    filtroArqueo.idArqueo = Number(this.idArqueo);
    this.cajasService.consultarArqueos(filtroArqueo).subscribe((arqueos: Arqueo[]) => {
      if (arqueos.length > 0) {
        this.arqueo = arqueos[0];
        this.buscarVentas();
      }
    });
  }

  public buscarMovimientos() {
    const idArqueo: number = Number(this.idArqueo);
    this.cajasService.consultarMovimientosManuales(idArqueo).subscribe((movimientos: MovimientoManual[]) => {
      this.movimientosManuales = movimientos;

      // mapear los movimientos manuales al formato de la tabla
      if (this.movimientosManuales.length > 0) {
        const movimientosParaTabla = movimientos.map((movimiento) => ({
          id: movimiento.id,
          fecha: movimiento.fechaMovimiento,
          formaDePago: { id: movimiento.formaPago.id, nombre: movimiento.formaPago.nombre },
          descripcion: movimiento.descripcion,
          tipoMovimiento: movimiento.tipoMovimiento,
          montoTotal: movimiento.tipoMovimiento.toLowerCase() === 'egreso' ? -Math.abs(movimiento.monto) : Math.abs(movimiento.monto) // si es egreso debería ser negativo
        }) as unknown as Venta); // perdon al que sea que lea esto

        this.tableDataSource.data = [...this.tableDataSource.data, ...movimientosParaTabla];
      }

      this.calcularFormasPago();
      this.isLoading = false;
    });
  }

  public filtrarTabla(idFormaPago: number): void {
    if (idFormaPago === 0) {
      // Si se selecciona "Todas", muestra todos los datos
      this.tableDataSource.filter = '';
    } else {
      // Filtra por la forma de pago seleccionada
      this.tableDataSource.filterPredicate = (data: any) => data.formaDePago.id === idFormaPago;
      this.tableDataSource.filter = idFormaPago.toString();
    }
  }

  public buscarVentas() {
    if (this.arqueo) {
      this.isLoading = true;
      const arqueo = this.arqueo;
      const fechaHora = new Date(arqueo.fechaApertura);

      // Genera un DATE a partir de la fecha y hora de apertura del arqueo
      const [hours, minutes, seconds] = (arqueo.horaApertura as unknown as string).split(':').map(Number);
      fechaHora.setHours(hours, minutes, seconds || 0);

      // Convierte a un string 'es-AR' la fecha y hora del arqueo
      const fechaHoraLocal = fechaHora.toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).replace('T', ' ');

      this.ventasService.buscarVentasFechaHora(fechaHoraLocal).subscribe((ventas: Venta[]) => {
        this.ventas = ventas.map((venta) => ({
          ...venta,
          montoTotal: parseFloat(venta.montoTotal as unknown as string) || 0 // por algun motivo algunas ventas tienen el monto como string
        }));

        this.determinarAnulacion();
        this.tableDataSource.data = this.ventas;
        this.tableDataSource.paginator = this.paginator;
        this.tableDataSource.sort = this.sort;
        this.buscarMovimientos();
      });
    }
  }

  private determinarAnulacion() {
    this.ventas.forEach(venta => {
      if (venta.anulada || venta.fechaAnulacion || !venta.fechaFacturacion) {
        venta.montoTotal = -Math.abs(venta.montoTotal);
      }
    });
  }

  public toggleDetalle(forma: any): void {
    forma.detalleVisible = !forma.detalleVisible;
  }

  public calcularFormasPago(): void {
    this.formasPago.forEach((forma) => {
      // Calcula los ingresos
      const ingresosVentas = this.ventas
        .filter((v: Venta) => v.formaDePago.nombre === forma.nombre && v.fechaFacturacion && !v.fechaAnulacion)
        .reduce((sum: number, venta: Venta) => sum + venta.montoTotal, 0);

      const ingresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre && m.tipoMovimiento.toLowerCase() === 'ingreso')
        .reduce((sum: number, mov: MovimientoManual) => sum + mov.monto, 0);

      forma.totalIngresos = ingresosVentas + ingresosMovimientos;
      forma.detallesIngresos = [
        { concepto: 'Ventas facturadas', monto: ingresosVentas },
        { concepto: 'Movimientos manuales', monto: ingresosMovimientos },
      ];

      // Calcula los egresos
      const egresosVentas = this.ventas
        .filter((v: Venta) => v.formaDePago.nombre === forma.nombre && (v.fechaAnulacion || !v.fechaFacturacion))
        .reduce((sum: number, venta: Venta) => sum + venta.montoTotal, 0);

      const egresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre && m.tipoMovimiento.toLowerCase() === 'egreso')
        .reduce((sum: number, mov: MovimientoManual) => sum + (mov.monto * -1), 0);

      forma.totalEgresos = egresosVentas + egresosMovimientos;
      forma.detallesEgresos = [
        {
          concepto: forma.id === 6 ? 'Cuentas corrientes pendientes de pago' : 'Ventas anuladas',
          monto: egresosVentas
        },
        { concepto: 'Movimientos manuales', monto: egresosMovimientos }
      ];
    });

    this.calcularTotalesYDiferencias(this.formasPago)
  }

  private calcularTotalesYDiferencias(listaFormasPago: FormaDePago[]): void {
    // Inicializar totales
    this.totalCaja = 0;
    this.totalOtrosMedios = 0;
    this.diferenciaCaja = 0;
    this.diferenciaOtrosMedios = 0;

    // Buscar la forma de pago en efectivo
    const formaEfectivo = listaFormasPago.find((forma) => forma.nombre.toLowerCase() === 'efectivo');

    if (formaEfectivo) {
      // Calcular total en caja (efectivo)
      this.totalCaja =
        (Number(this.arqueo?.montoInicial) || 0) +
        (formaEfectivo.totalIngresos || 0) +
        (formaEfectivo.totalEgresos || 0);

      // Calcular diferencia en caja
      const montoUsuarioCaja = this.txCantidadDineroCaja.value || 0;
      if (montoUsuarioCaja !== 0) {
        // si el total llegase a ser negativo, la resta pasa a ser suma
        this.diferenciaCaja = this.totalCaja < 0
          ? montoUsuarioCaja + this.totalCaja
          : montoUsuarioCaja - this.totalCaja;
      } else {
        this.diferenciaCaja = 0;
      }
    }

    // Calcular totales para otros medios
    listaFormasPago.forEach((forma) => {
      if (forma.nombre.toLowerCase() !== 'efectivo') {
        const ingresos = forma.totalIngresos || 0;
        let egresos = forma.totalEgresos || 0;

        // Excluir egresos por cuenta corriente (id 6)
        if (forma.id === 6) {
          egresos = 0;
        }

        this.totalOtrosMedios += ingresos - egresos;
      }
    });

    // Calcular diferencia en otros medios
    const montoUsuarioOtrosMedios = this.txCantidadDineroOtrosMedios.value || 0;
    if (montoUsuarioOtrosMedios !== 0) {
      // si el total llegase a ser negativo, la resta pasa a ser suma
      this.diferenciaOtrosMedios = this.totalOtrosMedios < 0
        ? montoUsuarioOtrosMedios + this.totalOtrosMedios
        : montoUsuarioOtrosMedios - this.totalOtrosMedios;
    } else {
      this.diferenciaOtrosMedios = 0;
    }
  }

  public registrarMovimiento() {
    this.eliminarValidadoresCantidadDinero(); // temporalmente

    if (this.form.valid) {
      const movimiento: MovimientoManual = new MovimientoManual();

      movimiento.idArqueo = Number(this.idArqueo);
      movimiento.fechaMovimiento = new Date();
      movimiento.formaPago = this.txFormaPago.value;
      movimiento.descripcion = this.txDescripcion.value;
      movimiento.tipoMovimiento = this.txTipoMovimiento.value;
      movimiento.monto = this.txMonto.value;

      this.cajasService.registrarMovimientoManual(movimiento).subscribe((respuesta) => {
        if (respuesta.mensaje === 'OK') {
          this.notificacionService.openSnackBarSuccess('El movimiento se registró con éxito');
          this.buscarMovimientos();
          this.form.reset();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar un movimiento, inténtelo nuevamente');
        }
      });
    }
    this.restaurarValidadoresCantidadDinero(); // restaurar
  }

  private eliminarValidadoresCantidadDinero() {
    this.txCantidadDineroCaja?.clearValidators();
    this.txCantidadDineroCaja?.updateValueAndValidity();
    this.txCantidadDineroOtrosMedios?.clearValidators();
    this.txCantidadDineroOtrosMedios?.updateValueAndValidity();
  }

  private restaurarValidadoresCantidadDinero() {
    this.txCantidadDineroCaja?.setValidators([Validators.required]);
    this.txCantidadDineroCaja?.updateValueAndValidity();
    this.txCantidadDineroOtrosMedios?.setValidators([Validators.required]);
    this.txCantidadDineroOtrosMedios?.updateValueAndValidity();
  }

  public eliminarMovimiento(idMovimiento: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el movimiento manual?', 'Eliminar Movimiento') //Está seguro?
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.cajasService.eliminarMovimientoManual(idMovimiento).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Movimiento eliminado con éxito');

              // Eliminar de lista de movimientos temporal
              this.movimientosManuales = this.movimientosManuales.filter((mov) => mov.id !== idMovimiento);

              // Eliminar el movimiento de la tabla
              this.tableDataSource.data = this.tableDataSource.data.filter(
                (item: any) => item.id !== idMovimiento
              );

              // Actualiza el MatTableDataSource
              this.tableDataSource._updateChangeSubscription();

              // Recalcular totales
              this.calcularFormasPago();

            } else {
              this.notificacionService.openSnackBarError('Error al eliminar los movimientos');
            }
          });
        }
      });
  }

  public cerrarArqueo() {
    
  }

  private filtroSuscripciones() {
    // Suscripción a cambios en txCantidadDineroCaja
    this.txCantidadDineroCaja.valueChanges.subscribe(() => {
      this.calcularTotalesYDiferencias(this.formasPago);
    });

    // Suscripción a cambios en txCantidadDineroOtrosMedios
    this.txCantidadDineroOtrosMedios.valueChanges.subscribe(() => {
      this.calcularTotalesYDiferencias(this.formasPago);
    });
  }

  get txTipoMovimiento(): FormControl {
    return this.form.get('txTipoMovimiento') as FormControl;
  }

  get txDescripcion(): FormControl {
    return this.form.get('txDescripcion') as FormControl;
  }

  get txMonto(): FormControl {
    return this.form.get('txMonto') as FormControl;
  }

  get txFormaPago(): FormControl {
    return this.form.get('txFormaPago') as FormControl;
  }

  get txCantidadDineroCaja(): FormControl {
    return this.form.get('txCantidadDineroCaja') as FormControl;
  }

  get txCantidadDineroOtrosMedios(): FormControl {
    return this.form.get('txCantidadDineroOtrosMedios') as FormControl;
  }

  protected readonly Math = Math;
}
