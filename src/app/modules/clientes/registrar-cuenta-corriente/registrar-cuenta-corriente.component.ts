import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnackBarService } from "../../../services/snack-bar.service";
import { Usuario } from "../../../models/usuario.model";
import { CuentaCorrienteService } from "../../../services/cuenta-corriente.service";

@Component({
  selector: 'app-registrar-cuenta-corriente',
  templateUrl: './registrar-cuenta-corriente.component.html',
  styleUrls: ['./registrar-cuenta-corriente.component.scss']
})
export class RegistrarCuentaCorrienteComponent {
  public form: FormGroup;
  public listaUsuarios: Usuario[] = [];
  public esConsulta: boolean;

  constructor(
    private fb: FormBuilder,
    private cuentaCorrienteService: CuentaCorrienteService,
    private dialogRef: MatDialogRef<RegistrarCuentaCorrienteComponent>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      cuentaCorriente: any;
    }
  ) {
    this.form = new FormGroup({});
    this.esConsulta = this.data.esConsulta;
  }

  ngOnInit() {
    this.crearFormulario();

    if (this.data.formDesactivado) {
      this.form.disable();
    }

    this.buscarUsuarios();

    this.txUsuario.valueChanges.subscribe(() => {
      this.actualizarNombreApellido();
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txUsuario: [this.data.cuentaCorriente?.usuario?.id || '', [Validators.required]],
      txNombre: [this.data.cuentaCorriente?.usuario?.nombre || '', [Validators.required]],
      txApellido: [this.data.cuentaCorriente?.usuario?.apellido || '', [Validators.required]],
      txCreada: [this.data.cuentaCorriente?.creada || '', [Validators.required]],
      txBalance: [this.data.cuentaCorriente?.balance || '', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  private buscarUsuarios() {
    this.cuentaCorrienteService.buscarUsuarios().subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });
  }

  private actualizarNombreApellido() {
    const usuarioId = this.txUsuario.value;
    const usuarioSeleccionado = this.listaUsuarios.find(u => u.id === usuarioId);
    if (usuarioSeleccionado) {
      this.txNombre.setValue(usuarioSeleccionado.nombre, { emitEvent: false });
      this.txApellido.setValue(usuarioSeleccionado.apellido, { emitEvent: false });
    }
  }

  public registrarCuentaCorriente() {
    if (this.form.valid) {
      const cuentaCorriente = this.construirCuentaCorriente();
      this.cuentaCorrienteService.registrarCuentaCorriente(cuentaCorriente).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La cuenta corriente se registró con éxito');
      });
    }
  }

  public modificarCuentaCorriente() {
    if (this.form.valid) {
      const cuentaCorriente = this.construirCuentaCorriente(this.data.cuentaCorriente?.id);
      this.cuentaCorrienteService.modificarCuentaCorriente(cuentaCorriente).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La cuenta corriente se modificó con éxito');
      });
    }
  }

  private construirCuentaCorriente(id?: number): any {
    return {
      id: id || undefined,
      usuario: { id: this.txUsuario.value },
      creada: this.txCreada.value,
      balance: parseFloat(this.txBalance.value) || 0
    };
  }

  private gestionarRespuesta(respuesta: any, mensajeExito: string) {
    if (respuesta.mensaje === 'OK') {
      this.notificacionService.openSnackBarSuccess(mensajeExito);
      this.dialogRef.close();
    } else {
      this.notificacionService.openSnackBarError('Error al procesar la solicitud, intentelo nuevamente');
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public habilitarEdicion(){
    this.form.enable();
    this.txNombre.disable();
    this.txApellido.disable();
    this.data.formDesactivado = false;
    this.data.editar = true;
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('pattern')) return 'Formato inválido';
    return '';
  }

  get txUsuario(): FormControl {
    return this.form.get('txUsuario') as FormControl;
  }

  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txApellido(): FormControl {
    return this.form.get('txApellido') as FormControl;
  }

  get txCreada(): FormControl {
    return this.form.get('txCreada') as FormControl;
  }

  get txBalance(): FormControl {
    return this.form.get('txBalance') as FormControl;
  }
}

