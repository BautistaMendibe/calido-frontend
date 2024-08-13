import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidatorFn} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarEmpleadosComponent} from "../consultar-empleados/consultar-empleados.component";
import {Provincia} from "../../../models/provincia.model";
import {Localidad} from "../../../models/localidad.model";
import {DomicilioService} from "../../../services/domicilio.service";
import {Domicilio} from "../../../models/domicilio.model";


@Component({
  selector: 'app-registrar-empleados',
  templateUrl: './registrar-empleados.component.html',
  styleUrl: './registrar-empleados.component.scss'
})
export class RegistrarEmpleadosComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarEmpleadosComponent;

  private idProvincia: number;
  private idLocalidad: number;
  public listaProvincias: Provincia[] = [];
  public provinciasFiltradas: Provincia[] = [];
  public listaLocalidades: Localidad[] = [];
  public localidadesFiltradas: Localidad[] = [];

  public usuario: Usuario;
  public esConsulta: boolean;
  public formDesactivado: boolean;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private domicilioService: DomicilioService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarEmpleadosComponent
      usuario: Usuario;
      esConsulta: boolean;
      formDesactivado: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.usuario = this.data.usuario;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
    this.idProvincia = -1;
    this.idLocalidad = -1;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProvincias();

    if (this.esConsulta && this.usuario) {
      this.rellenarFormularioDataUsuario();
    }
  }

  // Validar que la fecha de nacimiento sea menor a la de hoy
  fechaMenorQueHoy(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const today = new Date();
      const birthDate = new Date(control.value);
      return birthDate < today ? null : { 'fechaInvalida': true };
    };
  }

  // Lista de generos para no hacer consulta a la base de datos.
  // En el rellenado de datos desde el back, se usa para mapear los id de genero con los nombres.
  generos = [
    { id: 1, nombre: 'Masculino' },
    { id: 2, nombre: 'Femenino' },
    { id: 3, nombre: 'No binario' },
    { id: 4, nombre: 'Otro' },
    { id: 5, nombre: 'Prefiero no decirlo' }
  ];


  private crearFormulario() {
    this.form = this.fb.group({
      txNombreUsuario: ['', [Validators.required]],
      txNombre: ['', [Validators.required]],
      txApellido: ['', [Validators.required]],
      txFechaNacimiento: ['', [this.fechaMenorQueHoy()]], // a date
      txCodigoPostal: ['', []], // a int
      txDNI: ['', [Validators.required, Validators.maxLength(8)]], // a int
      txCuil: ['', [Validators.required, Validators.maxLength(11)]], // mascara
      // txContrasena: ['', [
      //   Validators.required,
      //   Validators.minLength(8),
      //   Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/) //Mayus, minus y numero.
      // ]],
      txContrasena: ['', [Validators.required]],
      ddGenero: ['', []], // desplegable a int
      txProvincia: [ '', []],
      txLocalidad: [ {value: '', disabled: (!this.esConsulta || this.formDesactivado)}, []],
      txCalle: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, []],
      txNumero: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, []],
    });
  }

  // Método para aplicar validaciones al campo de contraseña
  applyPasswordValidations() {
    const passwordControl = this.form.get('txContrasena');
    if (passwordControl) {
      passwordControl.setValidators([Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[A-Z])(?=.*[0-9])/)]);
      passwordControl.updateValueAndValidity();
      passwordControl.setValue('');
    }
  }


  private rellenarFormularioDataUsuario() {
    this.txNombreUsuario.setValue(this.usuario.nombreUsuario);
    this.txNombre.setValue(this.usuario.nombre);
    this.txApellido.setValue(this.usuario.apellido);
    this.txFechaNacimiento.setValue(this.formatDate(this.usuario.fechaNacimiento));
    this.txCodigoPostal.setValue(this.usuario.codigoPostal);
    this.txDNI.setValue(this.usuario.dni);
    this.txCuil.setValue(this.usuario.cuil);
    // this.txContrasena.setValue(this.usuario.contrasena);
    this.txContrasena.setValue('********');
    this.ddGenero.setValue(this.usuario.idGenero);
    this.txProvincia.setValue(this.usuario.domicilio?.localidad?.provincia.nombre);
    this.txLocalidad.setValue(this.usuario.domicilio?.localidad?.nombre);
    this.txCalle.setValue(this.usuario.domicilio?.calle);
    this.txNumero.setValue(this.usuario.domicilio?.numero);

    if (this.usuario.domicilio?.localidad){
      this.obtenerLocalidadesPorProvincia(this.usuario.domicilio.localidad.provincia.id);
      this.localidadesFiltradas = this.filterLocalidades(this.usuario.domicilio.localidad.nombre);
    }

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  formatDate(fecha: Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
  }

  public habilitarEdicion(){
    this.form.enable();
  }

  private buscarProvincias(){
    this.domicilioService.obtenerProvincias().subscribe((provincias) => {
      this.listaProvincias = provincias;
      this.txProvincia.valueChanges.subscribe((provincia) => {
        this.provinciasFiltradas = this.filterProvincias(provincia);
      });
    });
  }

  public async seleccionarProvincia() {
    const nombreProvincia = this.txProvincia.value;
    this.idProvincia = await this.buscarIdProvincia(nombreProvincia);
    this.obtenerLocalidadesPorProvincia(this.idProvincia);

    this.txLocalidad.enable();
    this.txLocalidad.setValue(null);
    this.txCalle.setValue(null);
    this.txNumero.setValue(null);
    this.txCalle.disable();
    this.txNumero.disable();
  }

  private async buscarIdProvincia(nombre: string): Promise<number> {
    const provincia = this.provinciasFiltradas.find((provincia) => provincia.nombre === nombre);
    return provincia ? provincia.id : 0;
  }

  public filtrarLocalidades(){
    const busqueda = this.txLocalidad.value;
    this.localidadesFiltradas = this.filterLocalidades(busqueda);
  }

  public async seleccionarLocalidad() {
    const nombreLocalidad = this.txLocalidad.value;
    this.idLocalidad = await this.buscarIdLocalidad(nombreLocalidad);
    this.txCalle.enable();
    this.txNumero.enable();
  }

  private async buscarIdLocalidad(nombre: string): Promise<number> {
    const localidad = this.localidadesFiltradas.find((localidad) => localidad.nombre === nombre);
    return localidad ? localidad.id : 0;
  }

  public obtenerLocalidadesPorProvincia(idProvincia: number){
    this.domicilioService.obtenerLocalidadesPorProvincia(idProvincia).subscribe((localidades) => {
      this.listaLocalidades = localidades;
    });
  }

  private filterProvincias(busqueda: string) {
    return this.listaProvincias.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  private filterLocalidades(busqueda: string) {
    return this.listaLocalidades.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  public registrarNuevoEmpleado() {

      if (this.form.valid) {
      const empleado: Usuario = new Usuario();
      const domicilio: Domicilio = new Domicilio();
      empleado.nombreUsuario = this.txNombreUsuario.value;
      empleado.nombre = this.txNombre.value;
      empleado.apellido = this.txApellido.value;
      empleado.fechaNacimiento = this.txFechaNacimiento.value;
      empleado.codigoPostal = this.txCodigoPostal.value;
      empleado.dni = this.txDNI.value;
      empleado.cuil = this.txCuil.value;
      empleado.contrasena = this.txContrasena.value;
      empleado.idGenero = this.ddGenero.value;
      empleado.domicilio = domicilio;
      empleado.domicilio.localidad.id =  this.idLocalidad;
      empleado.domicilio.calle =  this.txCalle.value;
      empleado.domicilio.numero =  this.txNumero.value;
      // empleado.tipoUsuario.id = 1; // no se usa, asigno empleado (1) en back


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

  public modificarEmpleado() {
    if (this.form.valid) {
      console.log("A")
    } else {
      console.log("B")
    }
    if (this.form.valid) {
      const domicilio: Domicilio = new Domicilio();
      this.usuario.nombreUsuario = this.txNombreUsuario.value;
      this.usuario.nombre = this.txNombre.value;
      this.usuario.apellido = this.txApellido.value;
      this.usuario.fechaNacimiento = this.txFechaNacimiento.value;
      this.usuario.codigoPostal = this.txCodigoPostal.value;
      this.usuario.dni = this.txDNI.value;
      this.usuario.cuil = this.txCuil.value;
      if (this.txContrasena.value != '********') {
        this.usuario.contrasena = this.txContrasena.value;
      } else {
        this.usuario.contrasena = '********';
      }
      this.usuario.idGenero = this.ddGenero.value;
      this.usuario.domicilio = domicilio;
      this.usuario.domicilio.localidad.id =  this.idLocalidad;
      this.usuario.domicilio.calle =  this.txCalle.value;
      this.usuario.domicilio.numero =  this.txNumero.value;

      this.usuariosService.modificarUsuario(this.usuario).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Usuario modificado con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar el usuario');
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

  get txLocalidad(): FormControl {
    return this.form.get('txLocalidad') as FormControl;
  }

  get txCalle(): FormControl {
    return this.form.get('txCalle') as FormControl;
  }

  get txNumero(): FormControl {
    return this.form.get('txNumero') as FormControl;
  }

}
