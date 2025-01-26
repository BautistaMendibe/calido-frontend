import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {CajasService} from "../../../services/cajas.service";
import {VentasService} from "../../../services/ventas.services";
import {MatTableDataSource} from "@angular/material/table";
import {Arqueo} from "../../../models/Arqueo.model";
import {FiltrosArqueos} from "../../../models/comandos/FiltrosArqueos.comando";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FormaDePago} from "../../../models/formaDePago.model";
import {MovimientoManual} from "../../../models/movimientoManual.model";
import {NotificationService} from "../../../services/notificacion.service";
import {TiposMovimientoArqueoEnum} from "../../../shared/enums/tipos-movimiento-arqueo.enum";

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
  public formasPagoParaMovimientos: FormaDePago[] = [];
  public filtradoPorFormasPago: FormaDePago[] = [];
  public isLoading: boolean = false;
  public movimientosManuales: MovimientoManual[] = [];
  public formaPagoDefecto!: number;
  public formDesactivado: boolean = false;

  // Totales y diferencias
  public totalCaja: number = 0;
  public totalOtrosMedios: number = 0;
  public diferenciaCaja: number = 0;
  public diferenciaOtrosMedios: number = 0;

  public tableDataSource: MatTableDataSource<MovimientoManual> = new MatTableDataSource<MovimientoManual>([]);
  public columnas: string[] = ['fecha', 'formaPago', 'descripcion', 'tipoMovimiento', 'montoTotal'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private cajasService: CajasService,
    private ventasService: VentasService,
    private route: ActivatedRoute,
    private notificationDialogService: NotificationService
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idArqueo = params.get('id');
      this.crearFormulario();
      this.buscarArqueo();
      this.buscarFormasPago();
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
      // Asignar las formas de pago para el combo de movimientos (solo efectivo y transferencia)
      this.formasPagoParaMovimientos = formasPago.filter(fp => fp.id === 1 || fp.id === 5);

      // Mapear iconos para las formas de pago
      this.formasPago = formasPago.map((forma) => {
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
        this.buscarMovimientos();
      }
    });
  }

  private rellenarDatosFormulario() {
    this.calcularFormasPago();
    this.txCantidadDineroCaja.setValue(this.arqueo.cantidadDineroCajaUsuario);
    this.txCantidadDineroOtrosMedios.setValue(this.arqueo.cantidadDineroOtrosUsuario);
  }

  public buscarMovimientos() {
    const idArqueo: number = Number(this.idArqueo);
    this.cajasService.consultarMovimientosManuales(idArqueo).subscribe((movimientos: MovimientoManual[]) => {
      this.movimientosManuales = movimientos;

      this.tableDataSource.data = this.movimientosManuales;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;

      // Si el arqueo está cerrado, rellenamos los datos y deshabilitamos el formulario
      if (this.arqueo.horaCierre) {
        this.rellenarDatosFormulario();
        this.deshabilitarFormulario();
      } else {
        this.calcularFormasPago();
      }

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

  public toggleDetalle(forma: any): void {
    forma.detalleVisible = !forma.detalleVisible;
  }

  public calcularFormasPago(): void {
    // Inicializamos el total de anulaciones para cuenta corriente
    let totalEgresosVentasAnuladasCuentaCorriente = 0;

    this.formasPago.forEach((forma) => {
      // Ingresos: Ventas (excluyendo las anuladas y de cuenta corriente)
      const ingresosVentas = this.movimientosManuales
        .filter(
          (m: MovimientoManual) => m.formaPago.nombre === forma.nombre
            && m.tipoMovimiento.toLowerCase() === 'ingreso'
            && (m.idTipoMovimientoArqueo === this.tiposMovimientosArqueoEnum.VENTA))
        .reduce((sum: number, movimiento: MovimientoManual) => sum + Number(movimiento.monto), 0);

      // Ingresos: Pagos de cuenta corriente
      const ingresosPagos = this.movimientosManuales
        .filter(
          (m: MovimientoManual) => m.formaPago.nombre === forma.nombre
            && m.tipoMovimiento.toLowerCase() === 'ingreso'
            && (m.idTipoMovimientoArqueo === this.tiposMovimientosArqueoEnum.PAGO))
        .reduce((sum: number, movimiento: MovimientoManual) => sum + Number(movimiento.monto), 0);

      // Ingresos: Movimientos manuales ingresados por el administrador
      const ingresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre
          && m.tipoMovimiento.toLowerCase() === 'ingreso'
          && m.idTipoMovimientoArqueo === this.tiposMovimientosArqueoEnum.MOVIMIENTO_MANUAL)
        .reduce((sum: number, mov: MovimientoManual) => sum + Number(mov.monto), 0);

      forma.totalIngresos = ingresosVentas + ingresosMovimientos + ingresosPagos;

      forma.detallesIngresos = [
        { concepto: 'Ventas', monto: ingresosVentas },
        { concepto: 'Pagos de cuenta corriente', monto: ingresosPagos },
        { concepto: 'Movimientos manuales', monto: ingresosMovimientos },
      ];

      // Egresos: Anulaciones de ventas y devoluciones de pagos de cuenta corriente
      const egresosAnulacionVentas = this.movimientosManuales
        .filter(
          (m: MovimientoManual) => m.formaPago.nombre === forma.nombre
            && m.tipoMovimiento.toLowerCase() === 'egreso'
            && (m.idTipoMovimientoArqueo === this.tiposMovimientosArqueoEnum.ANULACION))
        .reduce((sum: number, movimiento: MovimientoManual) => sum + Number(movimiento.monto), 0);

      // Egresos: Devoluciones de pagos de cuenta corriente del usuario
      const egresosDevolucionPagos = this.movimientosManuales
        .filter(
          (m: MovimientoManual) => m.formaPago.nombre === forma.nombre
            && m.tipoMovimiento.toLowerCase() === 'egreso'
            && m.idTipoMovimientoArqueo === this.tiposMovimientosArqueoEnum.DEVOLUCION_PAGO)
        .reduce((sum: number, movimiento: MovimientoManual) => sum + Number(movimiento.monto), 0);

      // Egresos: Movimientos manuales egresados por el administrador manualmente
      let egresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre
          && m.tipoMovimiento.toLowerCase() === 'egreso'
          && m.idTipoMovimientoArqueo === this.tiposMovimientosArqueoEnum.MOVIMIENTO_MANUAL)
        .reduce((sum: number, mov: MovimientoManual) => sum + (Number(mov.monto) * -1), 0);

      forma.totalEgresos = egresosAnulacionVentas + egresosMovimientos + egresosDevolucionPagos;

      forma.detallesEgresos = [
        { concepto: 'Ventas anuladas', monto: egresosAnulacionVentas },
        { concepto: 'Pagos devueltos', monto: egresosDevolucionPagos },
        { concepto: 'Movimientos manuales', monto: egresosMovimientos },
      ];
    });

    this.calcularTotalesYDiferencias(this.formasPago);
  }

  private calcularTotalesYDiferencias(listaFormasPago: FormaDePago[]): void {
    this.totalCaja = 0;
    this.totalOtrosMedios = 0;
    this.diferenciaCaja = 0;
    this.diferenciaOtrosMedios = 0;

    const formaEfectivo = listaFormasPago.find((forma) => forma.nombre.toLowerCase() === 'efectivo');

    if (formaEfectivo) {
      this.totalCaja =
        (Number(this.arqueo?.montoInicial) || 0) +
        (Number(formaEfectivo.totalIngresos) || 0) +
        (Number(formaEfectivo.totalEgresos) || 0);

      const montoUsuarioCaja = Number(this.txCantidadDineroCaja.value) || 0;
      this.diferenciaCaja = this.totalCaja < 0
        ? montoUsuarioCaja + this.totalCaja
        : montoUsuarioCaja - this.totalCaja;
    }

    listaFormasPago.forEach((forma) => {
      if (forma.nombre.toLowerCase() !== 'efectivo') {
        let ingresos = Number(forma.totalIngresos) || 0;
        let egresos = Number(forma.totalEgresos) || 0;

        // Si la forma de pago es cuenta corriente, no considerar los ingresos (ventas) y egresos (anulaciones)
        // dado a que en cuenta corriente no se devuelve dinero, solo se devuelven pagos de cuenta corriente
        if (forma.id === 6) {
          ingresos = 0;
          egresos = 0;
        }

        this.totalOtrosMedios += ingresos + egresos;
      }
    });

    const montoUsuarioOtrosMedios = Number(this.txCantidadDineroOtrosMedios.value) || 0;
    this.diferenciaOtrosMedios = this.totalOtrosMedios < 0
      ? montoUsuarioOtrosMedios + this.totalOtrosMedios
      : montoUsuarioOtrosMedios - this.totalOtrosMedios;
  }

  public registrarMovimiento() {
    this.eliminarValidadoresCantidadDinero(); // temporalmente

    if (this.form.valid) {
      const movimiento: MovimientoManual = new MovimientoManual();

      movimiento.idArqueo = Number(this.idArqueo);
      movimiento.fechaMovimiento = new Date(); // Se registra de BD de todas formas (para evitar problemas de zonas horarias)
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

  public cerrarArqueo() {
    const cajaValue = this.txCantidadDineroCaja?.value;
    const otrosMediosValue = this.txCantidadDineroOtrosMedios?.value;

    if (
      cajaValue != null && String(cajaValue).trim() !== '' && !isNaN(Number(cajaValue)) && Number(cajaValue) >= 0 &&
      otrosMediosValue != null && String(otrosMediosValue).trim() !== '' && !isNaN(Number(otrosMediosValue)) && Number(otrosMediosValue) >= 0
    ) {

      const arqueo = new Arqueo();
      arqueo.id = Number(this.idArqueo);
      arqueo.horaCierre = new Date();
      arqueo.diferencia = this.diferenciaCaja;
      arqueo.diferenciaOtros = this.diferenciaOtrosMedios;
      arqueo.montoSistemaCaja = this.totalCaja;
      arqueo.montoSistemaOtros = this.totalOtrosMedios;
      arqueo.cantidadDineroCajaUsuario = this.txCantidadDineroCaja.value;
      arqueo.cantidadDineroOtrosUsuario = this.txCantidadDineroOtrosMedios.value;

      const diferenciaCajaAbs = Math.abs(this.diferenciaCaja || 0);
      const diferenciaOtrosAbs = Math.abs(this.diferenciaOtrosMedios || 0);
      // Si alguna diferencia es >= 1000, muestra el primer diálogo
      if (diferenciaCajaAbs >= 5000 || diferenciaOtrosAbs >= 5000) {
        this.notificationDialogService.confirmation(
          `Existen diferencias entre lo indicado
          y lo registrado por el sistema.
          ¿Está seguro que desea continuar?`,
          '¡Existen Diferencias!'
        )
          .afterClosed()
          .subscribe((firstDialogResult) => {
            if (firstDialogResult) {
              this.confirmarCierreArqueo(arqueo); // Procede al segundo diálogo
            }
          });
      } else {
        // Si las diferencias son menores a 1000, salta al segundo diálogo directamente
        this.confirmarCierreArqueo(arqueo);
      }
    }
  }

  // Método auxiliar para confirmar el cierre del arqueo
  private confirmarCierreArqueo(arqueo: Arqueo) {
    this.notificationDialogService.confirmation(
      `¿Desea cerrar el arqueo?
    Esta acción no es reversible.`,
      'Cerrar Arqueo'
    )
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.cajasService.cerrarArqueo(arqueo).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Arqueo cerrado con éxito');
              this.deshabilitarFormulario();
              window.location.reload();
            } else {
              this.notificacionService.openSnackBarError('Error al cerrar arqueo, intenta nuevamente.');
            }
          });
        }
      });
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

  private deshabilitarFormulario() {
    this.form.disable();
    this.formDesactivado = true;
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

  get tiposMovimientosArqueoEnum(): typeof TiposMovimientoArqueoEnum {
    return TiposMovimientoArqueoEnum;
  }

  protected readonly Math = Math;
}
