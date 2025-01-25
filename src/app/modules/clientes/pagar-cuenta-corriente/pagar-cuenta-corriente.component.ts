import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
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

@Component({
  selector: 'app-pagar-cuenta-corriente',
  templateUrl: './pagar-cuenta-corriente.component.html',
  styleUrl: './pagar-cuenta-corriente.component.scss'
})
export class PagarCuentaCorrienteComponent implements OnInit {

  public form: FormGroup;
  public formasDePago: FormaDePago[] = [];
  public fechaHoy: Date = new Date();
  private referencia: RegistrarCuentaCorrienteComponent;
  public darkMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private dialog: MatDialog,
    private notificationDialogService: NotificationService,
    private themeService: ThemeCalidoService,
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
      txMonto: ['', [Validators.required]],
      txFormaDePago: ['', [Validators.required]],
    });
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private buscarDataCombos() {
    this.consultarFormasDePago();
  }

  public consultarFormasDePago() {
    this.ventasService.buscarFormasDePago().subscribe((formasDePago) => {
      this.formasDePago = formasDePago.filter(forma => forma.id !== FormasDePagoEnum.CUENTA_CORRIENTE);
    });
  }

  public registrar() {
    if (this.form.valid) {
      this.notificationDialogService.confirmation(`¿Desea registrar un pago para esta venta?
      Esto modificará la caja del día.`, 'Registrar pago')
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            const movimiento: MovimientoCuentaCorriente = new MovimientoCuentaCorriente();
            movimiento.idCuentaCorriente = this.data.cuentaCorriente.id;
            movimiento.idVenta = this.txVenta.value;
            movimiento.fecha = this.txFecha.value;
            movimiento.monto = this.txMonto.value;
            movimiento.idFormaDePago = this.txFormaDePago.value;
            movimiento.idTipoMovimientoCuentaCorriente = this.getTiposMovimientosCuentaCorrienteEnum.PAGO;

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

  get getTiposMovimientosCuentaCorrienteEnum(): typeof TiposMovimientoCuentaCorrienteEnum {
    return TiposMovimientoCuentaCorrienteEnum;
  }
}
