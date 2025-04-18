import {Component, Inject, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarEmpleadosComponent} from "../consultar-empleados/consultar-empleados.component";
import {Provincia} from "../../../models/provincia.model";
import {Localidad} from "../../../models/localidad.model";
import {DomicilioService} from "../../../services/domicilio.service";
import {Domicilio} from "../../../models/domicilio.model";
import {Rol} from "../../../models/Rol";
import {firstValueFrom} from "rxjs";
import {TipoUsuario} from "../../../models/tipoUsuario.model";
import {ThemeCalidoService} from "../../../services/theme.service";


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
  public fechaHoy: Date = new Date();
  public listaProvincias: Provincia[] = [];
  public provinciasFiltradas: Provincia[] = [];
  public listaLocalidades: Localidad[] = [];
  public localidadesFiltradas: Localidad[] = [];

  public roles: Rol[] = [];

  public usuario: Usuario;
  public esConsulta: boolean;
  public hidePassword: boolean = true;
  public formDesactivado: boolean;
  public darkMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private domicilioService: DomicilioService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private themeService: ThemeCalidoService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarEmpleadosComponent
      usuario: Usuario;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
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
    this.obtenerInformacionTema();
    this.crearFormulario();
    this.buscarProvincias();
    this.buscarRoles();

    if (this.esConsulta && this.usuario) {
      this.rellenarFormularioDataUsuario();
    }
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
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
      txNombre: ['', [Validators.required, Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)]],
      txApellido: ['', [Validators.required, Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)]],
      txFechaNacimiento: ['', [this.fechaMenorQueHoy()]], // a date
      txCodigoPostal: ['', []], // an int
      txDNI: ['', [Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]],
      txCuil: ['', [Validators.maxLength(11)]], // se usa máscara
      txContrasena: ['', [Validators.required]],
      ddGenero: ['', []], // desplegable a int
      txProvincia: ['', {
        validators: [Validators.required, Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)],
        updateOn: 'change'
      }],
      txLocalidad: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, {
        validators: [Validators.required, Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)],
        updateOn: 'change'
      }],
      txCalle: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, [Validators.required]],
      txNumero: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, [Validators.pattern(/^[0-9]+$/)]],
      txRoles: [[], [Validators.required]],
      txMail: ['', [Validators.required, this.emailValidator()]]
    });

    this.txProvincia.addValidators(this.provinceValidator());
    this.txLocalidad.addValidators(this.localityValidator());
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

  private emailValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
      const valid = emailPattern.test(control.value);
      return valid ? null : { invalidEmail: { value: control.value } };
    };
  }

  private provinceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;
      const valid = this.provinciasFiltradas.some(provincia => provincia.nombre === control.value);
      return valid ? null : { invalidProvince: { value: control.value } };
    };
  }

  private localityValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;
      const valid = this.localidadesFiltradas.some(localidad => localidad.nombre === control.value);
      return valid ? null : { invalidLocality: { value: control.value } };
    };
  }

  private rellenarFormularioDataUsuario() {
    this.txNombreUsuario.setValue(this.usuario.nombreUsuario);
    this.txNombre.setValue(this.usuario.nombre);
    this.txApellido.setValue(this.usuario.apellido);
    this.txFechaNacimiento.setValue(this.usuario.fechaNacimiento);
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
    this.txRoles.setValue(this.usuario.roles.map(rol => rol.id));
    this.txMail.setValue(this.usuario.mail);

    if (this.usuario.domicilio?.localidad?.provincia?.id) {
      this.obtenerLocalidadesPorProvincia(this.usuario.domicilio.localidad.provincia.id)
        .then(() => {
          this.localidadesFiltradas = this.filterLocalidades(this.usuario.domicilio.localidad.nombre);
          return this.buscarIdLocalidad(this.usuario.domicilio.localidad.nombre);
        })
        .then((id) => {
          this.idLocalidad = id;
        })
    }

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  public habilitarEdicion(){
    this.form.enable();
    this.data.editar = true;
  }

  private buscarProvincias(){
    this.domicilioService.obtenerProvincias().subscribe((provincias) => {
      this.listaProvincias = provincias;
      this.txProvincia.valueChanges.subscribe((provincia) => {
        this.provinciasFiltradas = this.filterProvincias(provincia);
      });
    });
  }

  private buscarRoles() {
    this.usuariosService.obtenerRoles().subscribe((roles) => {
      this.roles = roles;
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

  public async obtenerLocalidadesPorProvincia(idProvincia: number): Promise<Localidad[]> {
    return firstValueFrom(this.domicilioService.obtenerLocalidadesPorProvincia(idProvincia))
      .then((localidades) => {
        this.listaLocalidades = localidades;
        return localidades;
      });
  }

  private filterProvincias(busqueda: string) {
    const normalizarTexto = (texto: string) =>
      texto ? texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

    const busquedaNormalizada = normalizarTexto(busqueda);

    return this.listaProvincias.filter((value) =>
      normalizarTexto(value.nombre).includes(busquedaNormalizada)
    );
  }

  private filterLocalidades(busqueda: string) {
    const normalizarTexto = (texto: string) =>
      texto ? texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

    const busquedaNormalizada = normalizarTexto(busqueda);

    return this.listaLocalidades.filter((value) =>
      normalizarTexto(value.nombre).includes(busquedaNormalizada)
    );
  }

  public registrarNuevoEmpleado() {

      if (this.form.valid) {
      const empleado: Usuario = new Usuario();
      const domicilio: Domicilio = new Domicilio();
      const tipoUsuario: TipoUsuario = new TipoUsuario();
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
      empleado.roles = this.txRoles.value;
      empleado.tipoUsuario = tipoUsuario;
      empleado.tipoUsuario.id = 1;
      empleado.mail = this.txMail.value;

      this.usuariosService.registrarUsuario(empleado).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('El empleado se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar un empleado, inténtelo nuevamente');
        }
      })
    }
  }

  public modificarEmpleado() {
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
      this.usuario.domicilio.localidad.id = this.idLocalidad;
      this.usuario.domicilio.calle = this.txCalle.value;
      this.usuario.domicilio.numero = this.txNumero.value;
      this.usuario.roles = this.txRoles.value;
      this.usuario.mail = this.txMail.value;

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

  get txRoles(): FormControl {
    return this.form.get('txRoles') as FormControl;
  }

  get txMail(): FormControl {
    return this.form.get('txMail') as FormControl;
  }

}
