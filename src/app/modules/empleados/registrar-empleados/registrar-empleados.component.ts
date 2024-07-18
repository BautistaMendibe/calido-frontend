import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarEmpleadosComponent} from "../consultar-empleados/consultar-empleados.component";


@Component({
  selector: 'app-registrar-empleados',
  templateUrl: './registrar-empleados.component.html',
  styleUrl: './registrar-empleados.component.scss'
})
export class RegistrarEmpleadosComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarEmpleadosComponent;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarEmpleadosComponent
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProvincias();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombreUsuario: ['', [Validators.required]],
      txNombre: ['', []],
      txApellido: ['', []],
      txFechaNac: ['', []], // a date
      txCodPostal: ['', []], // a int
      txDNI: ['', []], // a int
      txCuil: ['', []], // mascara
      txContrasena: ['', []],
      ddGenero: ['', []], // desplegable a int
      txProvincia: ['', []], // hacer el domicilio
    });
  }

  private buscarProvincias(){
    // TODO: Crear variable provincias: Provincias[]
    //
    // Crear una funcion para retornar las provincias
    // Rellenar el matOption txProvincias

  }

  public registrarNuevoEmpleado() {

    if (this.form.valid) {
      const empleado: Usuario = new Usuario();
      empleado.nombreUsuario = this.txNombreUsuario.value;
      empleado.nombre = this.txNombre.value;
      empleado.apellido = this.txApellido.value;
      empleado.fechaNacimiento = this.txFechaNacimiento.value;
      empleado.codigoPostal = this.txCodigoPostal.value;
      empleado.dni = this.txDNI.value;
      empleado.cuil = this.txCuil.value;
      empleado.contrasena = this.txContrasena.value;
      empleado.genero = this.ddGenero.value;
      empleado.tipoUsuario.id = 1; // asigno empleado


      this.usuariosService.registrarUsuario(empleado).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('El empleado se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar un empleado, intentelo nuevamente');
        }
      })

    }

  }

  public cancelar() {
    this.dialogRef.close();
  }

  // Getters
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
