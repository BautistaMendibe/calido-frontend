import {Component, Inject, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {VentasService} from "../../../services/ventas.services";
import {NotificationService} from "../../../services/notificacion.service";
import {ThemeCalidoService} from "../../../services/theme.service";
import {RegistrarCuentaCorrienteComponent} from "../registrar-cuenta-corriente/registrar-cuenta-corriente.component";
import {FormaDePago} from "../../../models/formaDePago.model";
import {MovimientoCuentaCorriente} from "../../../models/movimientoCuentaCorriente";
import {FormasDePagoEnum} from "../../../shared/enums/formas-de-pago.enum";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {TiposMovimientoCuentaCorrienteEnum} from "../../../shared/enums/tipo-movimiento-cuenta-corriente.enum";
import {Caja} from "../../../models/Caja.model";
import {FiltrosCajas} from "../../../models/comandos/FiltrosCaja.comando";
import {CajasService} from "../../../services/cajas.service";
import {Arqueo} from "../../../models/Arqueo.model";
import {FiltrosArqueos} from "../../../models/comandos/FiltrosArqueos.comando";
import {QRVentanaComponent} from "../../qr-ventana/qr-ventana.component";
import {Subject} from "rxjs";

@Component({
  selector: 'app-pagar-cuenta-corriente',
  templateUrl: './pagar-cuenta-corriente.component.html',
  styleUrl: './pagar-cuenta-corriente.component.scss'
})
export class PagarCuentaCorrienteComponent implements OnInit {

  public form: FormGroup;

  public formasDePago: FormaDePago[] = [];
  public cajas: Caja[] = [];
  private arqueosHoy: Arqueo[] = [];

  public fechaHoy: Date = new Date();
  private referencia: RegistrarCuentaCorrienteComponent;
  public darkMode: boolean = false;

  private stopPolling$ = new Subject<void>();
  private isDialogClosed = false;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private dialog: MatDialog,
    private notificationDialogService: NotificationService,
    private themeService: ThemeCalidoService,
    private cajasService: CajasService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: RegistrarCuentaCorrienteComponent;
      movimiento: MovimientoCuentaCorriente;
      cuentaCorriente: CuentaCorriente;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();
    this.buscarDataCombos();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txVenta: [{value: this.data.movimiento.idVenta, disabled: true}, [Validators.required]],
      txFecha: [{value: this.fechaHoy, disabled: true}, [Validators.required]],
      txMonto: ['', [Validators.required, this.maxWithContext(this.data.movimiento.monto, 'monetario'), this.montoMayorACeroValidator()]],
      txFormaDePago: ['', [Validators.required]],
      txCaja: ['', [Validators.required]]
    });
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private buscarDataCombos() {
    this.consultarFormasDePago();
    this.consultarCajas();
    this.buscarArqueoCajaHoy();
  }

  public consultarFormasDePago() {
    this.ventasService.buscarFormasDePago().subscribe((formasDePago) => {
      this.formasDePago = formasDePago.filter(forma => forma.id !== FormasDePagoEnum.CUENTA_CORRIENTE);
    });
  }

  public consultarCajas() {
    this.cajasService.consultarCajas(new FiltrosCajas()).subscribe((cajas) => {
      this.cajas = cajas;
    });
  }

  private buscarArqueoCajaHoy() {
    const filtro = new FiltrosArqueos();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    filtro.fechaApertura = hoy;

    this.cajasService.consultarArqueos(filtro).subscribe((arqueos) => {
      this.arqueosHoy = arqueos;
    });
  }

  public registrar() {
    if (this.form.valid) {
      // Validación de que la caja seleccionada esté abierta
      const arqueoConCaja = this.arqueosHoy.find((arqueo) => arqueo.idCaja === this.txCaja.value);
      if (!arqueoConCaja || arqueoConCaja.idEstadoArqueo !== 1) {
        this.notificacionService.openSnackBarError('La caja seleccionada no está abierta, intentelo nuevamente.');
        return;
      }

      this.notificationDialogService.confirmation(`¿Desea registrar un pago para esta venta?
      Esto modificará la caja del día.`, 'Registrar pago')
        .afterClosed()
        .subscribe(async (value) => {
          if (value) {
            const movimiento: MovimientoCuentaCorriente = new MovimientoCuentaCorriente();
            movimiento.idCuentaCorriente = this.data.cuentaCorriente.id;
            movimiento.idVenta = this.txVenta.value;
            movimiento.fecha = this.txFecha.value;
            movimiento.monto = this.txMonto.value;
            movimiento.idFormaDePago = this.txFormaDePago.value;
            movimiento.idTipoMovimientoCuentaCorriente = this.getTiposMovimientosCuentaCorrienteEnum.PAGO;
            movimiento.idCaja = this.txCaja.value;
            movimiento.idUsuario = this.data.cuentaCorriente.idUsuario;

            // Verificar que se paga con QR para esperar el pago ANTES de registrar el pago
            if (movimiento.idFormaDePago === this.formasDePagoEnum.QR) {
              const QRpagado = await this.pagarConQRSIRO(movimiento);
              if (QRpagado) {
                //console.log('Pago confirmado. Registrando el pago');
              } else {
                this.notificacionService.openSnackBarError('El pago no se completó. Por favor, reintente la venta.');
                return; // Detenemos el flujo para no registrar el pago
              }
            }
            // FIN QR SIRO

            this.usuariosService.registrarMovimientoCuentaCorriente(movimiento).subscribe((respuesta) => {
              if (respuesta.mensaje === 'OK') {
                this.notificacionService.openSnackBarSuccess('Pago registrado con éxito.');
                this.dialogRef.close(true);
              } else {
                this.notificacionService.openSnackBarError('Error al registrar pago. Intentelo nuevamente.');
                this.dialogRef.close(false);
              }
            });
          }
        });
    }
  }

  /**
   * Función para pagar con QR SIRO
   * Realiza 65 intentos de polling cada 5 segundos para verificar el estado del pago
   * @param venta
   * @private
   */
  private async pagarConQRSIRO(movimiento: MovimientoCuentaCorriente): Promise<boolean> {
    let QRPagado = false;

    if (movimiento.idFormaDePago !== this.formasDePagoEnum.QR) {
      return QRPagado;
    }

    this.notificacionService.openSnackBarSuccess('Generando pago...');
    try {
      // Generar el pago
      const respuestaPago = await this.ventasService.pagarConSIROQRPagosDeCuentaCorriente(movimiento).toPromise();

      if ((respuestaPago as { Hash: string }).Hash) {
        this.notificacionService.openSnackBarSuccess('Pago generado con éxito.');
        const idReferencia = (respuestaPago as { IdReferenciaOperacion: string }).IdReferenciaOperacion;

        if (idReferencia) {
          const dialogRef = this.mostrarQR(idReferencia);

          // Polling para consultar el estado del pago
          const pagoExitoso = await this.pollingEstadoPago(idReferencia, 65, 5000, dialogRef);
          if (pagoExitoso) {
            this.notificacionService.openSnackBarSuccess('El pago fue exitoso. Registrando venta.');
            QRPagado = true;

            // Actualizar el estado manualmente para que siempre se muestre el ícono
            if (dialogRef.componentInstance) {
              dialogRef.componentInstance.estadoPago = 'PAGADO';
              dialogRef.componentInstance.icono = 'check_circle';
            }

            setTimeout(() => {
              dialogRef.close();
            }, 2000);
          } else {
            this.notificacionService.openSnackBarError('Error. El pago no fue procesado.');
          }
        }
      }
    } catch (err) {
      console.error('Error en la llamada:', err);
      this.notificacionService.openSnackBarError('Error en la solicitud.');
    }

    return QRPagado;
  }

  /**
   * Función para realizar el polling del estado de un pago QR en una ventana modal.
   * Se consulta el estado de pago cada cierto intervalo de tiempo.
   * @param idReferencia
   * @param intentos
   * @param intervalo
   * @param dialogRef
   * @private
   */
  private async pollingEstadoPago(idReferencia: string, intentos: number, intervalo: number, dialogRef: MatDialogRef<QRVentanaComponent>): Promise<boolean> {
    this.stopPolling$ = new Subject<void>(); // Resetear el Subject
    this.isDialogClosed = false; // Reiniciar la bandera

    // Escuchar el cierre del diálogo
    const dialogCloseSubscription = dialogRef.afterClosed().subscribe(() => {
      if (!this.isDialogClosed) {
        this.isDialogClosed = true; // Evitar múltiples impresiones
        this.stopPolling$.next(); // Emitir señal para detener el polling
        this.stopPolling$.complete();
      }
    });

    try {
      for (let i = 0; i < intentos; i++) {
        // Verificar si el polling debe detenerse
        if (this.stopPolling$.isStopped || this.isDialogClosed) {
          break; // Salir del bucle si el polling fue cancelado
        }

        try {
          const respuestaConsulta = await this.ventasService.consultaPagoSIROQR(idReferencia).toPromise();
          if (Array.isArray(respuestaConsulta) && respuestaConsulta.length > 0) {
            const resultado = respuestaConsulta[respuestaConsulta.length - 1];
            const pagoExitoso = resultado.PagoExitoso;
            const estado = resultado.Estado;

            if (pagoExitoso && estado === 'PROCESADA') {
              dialogCloseSubscription.unsubscribe(); // Limpiar la suscripción
              return true; // Pago exitoso
            }
          }
        } catch (err) {
          console.error('Error al consultar el estado del pago:', err);
        }

        // Esperar antes de reintentar, con verificación para detener
        await this.delayWithCancel(intervalo, this.stopPolling$);
      }
    } finally {
      dialogCloseSubscription.unsubscribe(); // Asegurar la limpieza
    }

    return false; // Si se agotan los intentos
  }

  /**
   * Retrasa la ejecución por un tiempo determinado o la cancela si se emite un evento en `cancel$`.
   * @param ms - Tiempo en milisegundos para esperar.
   * @param cancel$ - Subject que permite cancelar el retraso.
   * @private
   */
  private async delayWithCancel(ms: number, cancel$: Subject<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, ms);

      cancel$.subscribe(() => {
        clearTimeout(timeout);
        reject('Polling cancelado.');
      });
    });
  }

  public mostrarQR(idReferenciaOperacion: string): MatDialogRef<QRVentanaComponent> {
    const qrImageUrl = 'assets/imgs/QR_SIRO.png'; // Ruta de tu imagen QR en el frontend
    return this.dialog.open(QRVentanaComponent, {
      data: { imageUrl: qrImageUrl, idReferenciaOperacion: idReferenciaOperacion },
      width: '400px',
    });
  }

  private maxWithContext(maxValue: number, context?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value != null && +control.value > maxValue) {
        return {
          max: { maxValue, context }
        };
      }
      return null;
    };
  }

  private montoMayorACeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return value > 0 ? null : { 'montoMayorCero': { value: control.value } };
    };
  }

  public setearTotalVentaEnMonto() {
    this.txMonto.setValue(this.data.movimiento.monto);
  }

  public cancelar() {
    this.dialogRef.close();
  }

  get txVenta() {
    return this.form.get('txVenta') as FormControl;
  }

  get txFecha() {
    return this.form.get('txFecha') as FormControl;
  }

  get txMonto() {
    return this.form.get('txMonto') as FormControl;
  }

  get txFormaDePago() {
    return this.form.get('txFormaDePago') as FormControl;
  }

  get txCaja() {
    return this.form.get('txCaja') as FormControl;
  }

  get getTiposMovimientosCuentaCorrienteEnum(): typeof TiposMovimientoCuentaCorrienteEnum {
    return TiposMovimientoCuentaCorrienteEnum;
  }

  get formasDePagoEnum(): typeof FormasDePagoEnum {
    return FormasDePagoEnum;
  }
}
