import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Usuario} from "../../../models/usuario.model";
import {ConsultarEmpleadosComponent} from "../consultar-empleados/consultar-empleados.component";
import {UsuariosService} from "../../../services/usuarios.service";

@Component({
  selector: 'app-detalle-empleados',
  templateUrl: './detalle-empleados.component.html',
  styleUrl: './detalle-empleados.component.scss'
})
export class DetalleEmpleadosComponent implements OnInit {

  private usuario: Usuario;
  private referencia: ConsultarEmpleadosComponent;
  public edit: boolean;
  public form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DetalleEmpleadosComponent>,
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      usuario: Usuario,
      edit: boolean,
      referencia: ConsultarEmpleadosComponent
    }
  ) {

    this.usuario = this.data.usuario;
    this.edit = this.data.edit;
    this.referencia = this.data.referencia;

    this.form = new FormGroup({});
  }

  ngOnInit() {

    this.crearFormulario();

    if (!this.edit) {
      this.deshabilitarFormulario();
    }

  }

  // Creamos el formulario con los datos del usuario que pasamos como parametro
  private crearFormulario() {
    this.form = this.fb.group({
      txNombreUsuario: [this.usuario.nombreUsuario, []],
      txNombre: [this.usuario.nombre, []],
      txApellido: [this.usuario.apellido, []],
      txFechaNacimiento: [this.usuario.fechaNacimiento, []],
      txCodigoPostal: [this.usuario.codigoPostal, []],
      txDNI: [this.usuario.dni, []],
      txCuil: [this.usuario.cuil, []],
      txContrasena: [this.usuario.contrasena, []],
      ddGenero: [this.usuario.idGenero, []],
      txProvincia: [this.usuario.domicilio.localidad.provincia.nombre, []],
    });
  }

  public habilitarEdicion() {
    this.edit = true;
    this.habilitarFormulario();
  }


  public cancelar() {
    this.dialogRef.close();
  }

  public modificarEmpleado() {
    const usuario: Usuario = new Usuario();

    usuario.id = this.usuario.id;
    usuario.nombre = this.txNombre.value;
    usuario.apellido = this.txApellido.value;
    usuario.nombreUsuario = this.txNombreUsuario.value;
    usuario.fechaNacimiento = this.txFechaNacimiento.value;
    usuario.codigoPostal = this.txCodigoPostal.value;
    usuario.dni = this.txDNI.value;
    usuario.cuil = this.txCuil.value;
    usuario.contrasena = this.txContrasena.value;
    usuario.idGenero = this.ddGenero.value;
    usuario.domicilio = this.txProvincia.value;

    this.usuariosService.modificarUsuario(usuario).subscribe((res) => {
      if (res.mensaje == 'OK') {
        this.notificacionService.openSnackBarSuccess('Usuario modificado con éxito');
        this.dialogRef.close();
        this.referencia.buscar();
      } else {
        this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar el usuario');
      }
    });
  }

  private deshabilitarFormulario(){
    this.form.disable();
  }

  private habilitarFormulario() {
    this.form.enable();
  }

  // Regios getters
  get txNombreUsuario(): FormControl {
    return this.form.get('txNombreUsuario') as FormControl;
  }

  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txApellido(): FormControl {
    return this.form.get('txApellido') as FormControl;
  }

  get txFechaNacimiento(): FormControl {
    return this.form.get('txFechaNacimiento') as FormControl;
  }

  get txCodigoPostal(): FormControl {
    return this.form.get('txCodigoPostal') as FormControl;
  }

  get txDNI(): FormControl {
    return this.form.get('txDNI') as FormControl;
  }

  get txCuil(): FormControl {
    return this.form.get('txCuil') as FormControl;
  }

  get txContrasena(): FormControl {
    return this.form.get('txContrasena') as FormControl;
  }

  get ddGenero(): FormControl {
    return this.form.get('ddGenero') as FormControl;
  }

  get txProvincia(): FormControl {
    return this.form.get('txProvincia') as FormControl;
  }



}
