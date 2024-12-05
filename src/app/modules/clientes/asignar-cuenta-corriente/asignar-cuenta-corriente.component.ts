import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {VentasService} from "../../../services/ventas.services";
import {NotificationService} from "../../../services/notificacion.service";
import {FiltrosCuentasCorrientes} from "../../../models/comandos/FiltrosCuentasCorrientes";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {Venta} from "../../../models/venta.model";
import {ConsultarVentasComponent} from "../../venta/consultar-ventas/consultar-ventas.component";
import {RegistrarCuentaCorrienteComponent} from "../registrar-cuenta-corriente/registrar-cuenta-corriente.component";


@Component({
  selector: 'app-asignar-cuenta-corriente',
  templateUrl: './asignar-cuenta-corriente.component.html',
  styleUrl: './asignar-cuenta-corriente.component.scss'
})
export class AsignarCuentaCorrienteComponent implements OnInit{

  public form: FormGroup;
  public cuentas: CuentaCorriente[] = [];
  private referencia: ConsultarVentasComponent;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private dialog: MatDialog,
    private notificationDialogService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarVentasComponent;
      venta: Venta;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.crearFormulario();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txCuenta: ['', [Validators.required]]
    });

    this.consultarCuentasCorrientes();
  }

  public consultarCuentasCorrientes() {
    this.usuariosService.consultarCuentasCorrientesxUsuario(new FiltrosCuentasCorrientes()).subscribe((cuentas) => {
      this.cuentas = cuentas;
    });
  }

  public asignar() {
    this.notificationDialogService.confirmation(`¿Desea generar una nota de crédito?
      Se añadirá balance positivo a la cuenta.`, 'Generar nota de crédito')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          const venta = this.data.venta;
          venta.cliente.id = this.txCuenta.value;

          this.ventasService.anularVenta(venta).subscribe((respuesta) => {
            if (respuesta.mensaje === 'OK') {
              this.notificacionService.openSnackBarSuccess('Venta anulada correctamente');
              this.dialogRef.close(true);
            } else {
              this.notificacionService.openSnackBarError('Error al anular venta. Intentelo nuevamente.');
              this.dialogRef.close(false);
            }
          });
        }
      });
  }

  public registrarNuevaCuenta() {
    const dialogRef = this.dialog.open(RegistrarCuentaCorrienteComponent, {
      width: '75%',
      height: 'auto',
      autoFocus: false,
      data: {
        referencia: this,
        esConsulta: false,
        formDesactivado: false
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.consultarCuentasCorrientes();
      }
    });
  }

  public cancelar() {
    this.dialogRef.close();
  }

  get txCuenta() {
    return this.form.get('txCuenta') as FormControl;
  }
}
