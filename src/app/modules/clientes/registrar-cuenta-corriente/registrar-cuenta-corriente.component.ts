import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ConsultarCuentasCorrientesComponent } from "../consultar-cuentas-corrientes/consultar-cuentas-corrientes.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CuentaCorriente } from "../../../models/cuentaCorriente.model";
import { SnackBarService } from "../../../services/snack-bar.service";
import { Usuario } from "../../../models/usuario.model";
import { UsuariosService } from "../../../services/usuarios.service";

@Component({
  selector: 'app-registrar-cuenta-corriente',
  templateUrl: './registrar-cuenta-corriente.component.html',
  styleUrls: ['./registrar-cuenta-corriente.component.scss']
})
export class RegistrarCuentaCorrienteComponent implements OnInit {

  public form: FormGroup;
  public listaUsuarios: Usuario[] = [];
  public usuariosFiltrados: Usuario[] = [];
  public esConsulta: boolean;
  private referencia: ConsultarCuentasCorrientesComponent;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    private dialogRef: MatDialogRef<RegistrarCuentaCorrienteComponent>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarCuentasCorrientesComponent;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      cuentaCorriente: CuentaCorriente;
    }
  ) {
    this.form = new FormGroup({});
    this.esConsulta = this.data.esConsulta;
    this.referencia = this.data.referencia;
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
      txCreada: [{ value: this.data.cuentaCorriente?.fechaDesde || '', disabled: true }, [Validators.required]],
      txBalance: [this.data.cuentaCorriente?.balanceTotal || '', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  private buscarUsuarios() {
    this.usuarioService.consultarAllUsuarios().subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
      this.txUsuario.valueChanges.subscribe((usuario) => {
        this.usuariosFiltrados = this.filtrarLista(usuario, this.listaUsuarios);
      });
    });
  }

  private filtrarLista(busqueda: string, lista: any[]): any[] {
    if (typeof busqueda !== 'string') {
      return lista;
    }
    return lista.filter((value) => value.nombre.toLowerCase().startsWith(busqueda.toLowerCase()));
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
    const cuentaCorriente = {
      id: id || undefined,
      usuario: { id: this.txUsuario.value },
      fechaDesde: this.txCreada.value ,
      balanceTotal: parseFloat(this.txBalance.value) || 0
    } as CuentaCorriente;
    return cuentaCorriente;
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
    this.txUsuario.disable();
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('pattern')) return 'Valor no válido';
    return '';
  }

  get txUsuario() { return this.form.get('txUsuario') as FormControl; }
  get txNombre() { return this.form.get('txNombre') as FormControl; }
  get txApellido() { return this.form.get('txApellido') as FormControl; }
  get txCreada() { return this.form.get('txCreada') as FormControl; }
  get txBalance() { return this.form.get('txBalance') as FormControl; }
}
