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
  public formasPagoParaMovimientos: FormaDePago[] = [];
  public filtradoPorFormasPago: FormaDePago[] = [];
  public ventas: Venta[] = [];
  public isLoading: boolean = false;
  public movimientosManuales: MovimientoManual[] = [];
  public formaPagoDefecto!: number;
  public formDesactivado: boolean = false;

  // Totales y diferencias
  public totalCaja: number = 0;
  public totalOtrosMedios: number = 0;
  public diferenciaCaja: number = 0;
  public diferenciaOtrosMedios: number = 0;

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
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

  private rellenarDatosFormulario() {
    this.calcularFormasPago();
    this.txCantidadDineroCaja.setValue(this.arqueo.cantidadDineroCajaUsuario);
    this.txCantidadDineroOtrosMedios.setValue(this.arqueo.cantidadDineroOtrosUsuario);
  }

  public buscarMovimientos() {
    const idArqueo: number = Number(this.idArqueo);
    this.cajasService.consultarMovimientosManuales(idArqueo).subscribe((movimientos: MovimientoManual[]) => {
      this.movimientosManuales = movimientos;

      // Mapeamos los movimientos manuales al formato de la tabla
      const movimientosParaTabla = movimientos.map((movimiento) => ({
        id: movimiento.id,
        fecha: movimiento.fechaMovimiento,
        formaDePago: { id: movimiento.formaPago.id, nombre: movimiento.formaPago.nombre },
        descripcion: movimiento.descripcion,
        tipoMovimiento: movimiento.tipoMovimiento,
        montoTotal: movimiento.tipoMovimiento.toLowerCase() === 'egreso' ? -Math.abs(movimiento.monto) : Math.abs(movimiento.monto) // Si es egreso debería ser negativo
      }) as unknown as Venta);

      // Filtrar datos que NO son movimientos manuales
      const datosNoMovimientos = this.tableDataSource.data.filter((item: any) => !this.movimientosManuales.some(mov => mov.id === item.id));

      // Combinar datos no relacionados con los nuevos movimientos
      this.tableDataSource.data = [...datosNoMovimientos, ...movimientosParaTabla];

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

  public buscarVentas() {
    if (this.arqueo) {
      this.isLoading = true;
      const arqueo = this.arqueo;

      // Crear `fechaHora` con la fecha de apertura
      const fechaHora = new Date(arqueo.fechaApertura);

      // Ajustar la hora para `fechaHora` utilizando `horaApertura`
      if (arqueo.horaApertura) {
        const [hours, minutes, seconds] = (arqueo.horaApertura as unknown as string).split(':').map(Number);
        fechaHora.setHours(hours, minutes, seconds || 0);
      }

      // Convertir `fechaHora` al formato de timestamp en zona horaria argentina
      const fechaHoraLocal = fechaHora
        .toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' })
        .replace('T', ' ');

      let fechaHoraCierreLocal = null;

      // Manejar `fechaHoraCierre` si está disponible
      if (arqueo.horaCierre) {
        const fechaHoraCierre = new Date(arqueo.fechaApertura); // Usar la misma fecha base
        const [hoursCierre, minutesCierre, secondsCierre] = (arqueo.horaCierre as unknown as string).split(':').map(Number);
        fechaHoraCierre.setHours(hoursCierre, minutesCierre, secondsCierre || 0);

        fechaHoraCierreLocal = fechaHoraCierre
          .toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' })
          .replace('T', ' ');
      }

      // Llamar al servicio con las fechas calculadas
      this.ventasService.buscarVentasFechaHora(fechaHoraLocal, fechaHoraCierreLocal).subscribe((ventas: Venta[]) => {
        this.ventas = ventas.map((venta) => ({
          ...venta,
          montoTotal: parseFloat(venta.montoTotal as unknown as string) || 0, // Convertir a número si es necesario
        }));

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
    // Inicializamos el total de anulaciones para cuenta corriente
    let totalEgresosVentasAnuladasCuentaCorriente = 0;

    this.formasPago.forEach((forma) => {
      // Ingresos: Ventas facturadas (excluyendo las anuladas) y movimientos manuales
      const ingresosVentas = this.ventas
        .filter((v: Venta) => v.formaDePago.nombre === forma.nombre && v.fechaFacturacion) // Solo facturadas
        .reduce((sum: number, venta: Venta) => sum + Number(venta.montoTotal), 0);

      const ingresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre && m.tipoMovimiento.toLowerCase() === 'ingreso')
        .reduce((sum: number, mov: MovimientoManual) => sum + Number(mov.monto), 0);

      forma.totalIngresos = ingresosVentas + ingresosMovimientos;

      forma.detallesIngresos = [
        { concepto: 'Ventas facturadas', monto: ingresosVentas },
        { concepto: 'Movimientos manuales', monto: ingresosMovimientos },
      ];

      // Egresos
      let egresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre && m.tipoMovimiento.toLowerCase() === 'egreso')
        .reduce((sum: number, mov: MovimientoManual) => sum + (Number(mov.monto) * -1), 0);

      let egresosVentas = 0;

      // Para cuenta corriente (forma.id === 6)
      if (forma.id === 6) {
        // Suma todas las ventas anuladas independientemente del método de pago porque al fin y al cabo todas
        // van a cuenta corriente como crédito (lo que representa un egreso para el negocio)
        egresosVentas = this.ventas
          .filter((v: Venta) => v.fechaAnulacion)
          .reduce((sum: number, venta: Venta) => sum + Number(venta.montoTotal), 0);

        totalEgresosVentasAnuladasCuentaCorriente = egresosVentas;

        // Calculamos el saldo pendiente (ventas sin fecha de facturación)
        const saldoCuentaCorrientePendiente = this.ventas
          .filter((v: Venta) => v.formaDePago.nombre === forma.nombre && !v.fechaFacturacion)
          .reduce((sum: number, venta: Venta) => sum + Number(venta.montoTotal), 0);

        forma.totalEgresos = egresosVentas + saldoCuentaCorrientePendiente + egresosMovimientos;

        forma.detallesEgresos = [
          { concepto: 'Ventas anuladas', monto: egresosVentas },
          { concepto: 'Saldo cuenta corriente pendiente de pago', monto: saldoCuentaCorrientePendiente },
          { concepto: 'Movimientos manuales', monto: egresosMovimientos },
        ];
      } else {
        // Para los demás medios de pago, solo egresos manuales
        forma.totalEgresos = egresosMovimientos;

        forma.detallesEgresos = [
          { concepto: 'Movimientos manuales', monto: egresosMovimientos },
        ];
      }
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
        const ingresos = Number(forma.totalIngresos) || 0;
        let egresos = Number(forma.totalEgresos) || 0;

        if (forma.id === 6) egresos = 0;

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
              this.notificacionService.openSnackBarError('Error al eliminar el movimiento, intenta nuevamente.');
            }
          });
        }
      });
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
      if (diferenciaCajaAbs >= 1000 || diferenciaOtrosAbs >= 1000) {
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

  protected readonly Math = Math;
}
