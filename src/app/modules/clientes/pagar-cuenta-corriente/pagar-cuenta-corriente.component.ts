import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {VentasService} from "../../../services/ventas.services";
import {NotificationService} from "../../../services/notificacion.service";
import {ThemeCalidoService} from "../../../services/theme.service";
import {Venta} from "../../../models/venta.model";
import {RegistrarCuentaCorrienteComponent} from "../registrar-cuenta-corriente/registrar-cuenta-corriente.component";
import {FormaDePago} from "../../../models/formaDePago.model";
import {MovimientoCuentaCorriente} from "../../../models/movimientoCuentaCorriente";
import {FormasDePagoEnum} from "../../../shared/enums/formas-de-pago.enum";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {TiposMovimientoCuentaCorrienteEnum} from "../../../shared/enums/tipo-movimiento-cuenta-corriente.enum";
import {TiposFacturacionEnum} from "../../../shared/enums/tipos-facturacion.enum";

@Component({
  selector: 'app-pagar-cuenta-corriente',
  templateUrl: './pagar-cuenta-corriente.component.html',
  styleUrl: './pagar-cuenta-corriente.component.scss'
})
export class PagarCuentaCorrienteComponent implements OnInit {

  public form: FormGroup;
  public ventas: Venta[] = [];
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
      venta: Venta;
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
      txVenta: [{value: this.data.venta.id, disabled: true}, [Validators.required]],
      txFecha: [{value: this.fechaHoy, disabled: true}, [Validators.required]],
      txMonto: ['', [Validators.required]],
      txFormaDePago: ['', [Validators.required]],
      txComentario: ['', [Validators.maxLength(200)]]
    });
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private buscarDataCombos() {
    this.consultarVentas();
    this.consultarFormasDePago();
  }

  public consultarVentas() {
    this.ventasService.buscarVentasPorCC(this.data.venta.cliente.id).subscribe((ventas) => {
      this.ventas = ventas;
    });
  }

  public consultarFormasDePago() {
    this.ventasService.buscarFormasDePago().subscribe((formasDePago) => {
      this.formasDePago = formasDePago.filter(forma => forma.id !== FormasDePagoEnum.CUENTA_CORRIENTE);
    });
  }

  public registrar() {
    if (this.form.valid) {
      this.notificationDialogService.confirmation(`¿Desea registrar un pago a esta cuenta corriente?
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
            movimiento.descripcion = this.txComentario.value;
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

  get txComentario() {
    return this.form.get('txComentario') as FormControl;
  }

  get getTiposMovimientosCuentaCorrienteEnum(): typeof TiposMovimientoCuentaCorrienteEnum {
    return TiposMovimientoCuentaCorrienteEnum;
  }
}
