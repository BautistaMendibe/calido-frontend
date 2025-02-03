import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {UsuariosService} from "../../../services/usuarios.service";
import {DomicilioService} from "../../../services/domicilio.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Provincia} from "../../../models/provincia.model";
import {Localidad} from "../../../models/localidad.model";
import {Usuario} from "../../../models/usuario.model";
import {firstValueFrom} from "rxjs";
import {Domicilio} from "../../../models/domicilio.model";
import {TipoUsuario} from "../../../models/tipoUsuario.model";
import {SpResult} from "../../../models/resultadoSp.model";
import {CondicionIva} from "../../../models/CondicionIva.model";
import {VentasService} from "../../../services/ventas.services";
import {ConsultarClientesComponent} from "../consultar-clientes/consultar-clientes.component";
import {ThemeCalidoService} from "../../../services/theme.service";

@Component({
  selector: 'app-registrar-clientes',
  templateUrl: './registrar-clientes.component.html',
  styleUrl: './registrar-clientes.component.scss'
})
export class RegistrarClientesComponent implements OnInit {

  public form: FormGroup;
  public referencia: ConsultarClientesComponent;

  private idProvincia: number;
  private idLocalidad: number;
  public listaProvincias: Provincia[] = [];
  public provinciasFiltradas: Provincia[] = [];
  public listaLocalidades: Localidad[] = [];
  public localidadesFiltradas: Localidad[] = [];
  public usuario: Usuario;
  public condicionesIva: CondicionIva[] = [];
  public fechaHoy: Date = new Date();

  public esConsulta: boolean;
  public formDesactivado: boolean;
  public isLoading: boolean = false;
  public pedirCUIT: boolean = false;
  public darkMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private domicilioService: DomicilioService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private ventaServive: VentasService,
    private themeService: ThemeCalidoService,
    @Inject(MAT_DIALOG_DATA) public data: {
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      usuario: Usuario;
      referencia: ConsultarClientesComponent;
    }
  ) {
    this.form = new FormGroup({});
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
    this.usuario = this.data.usuario;
    this.referencia = this.data.referencia;
    this.idProvincia = -1;
    this.idLocalidad = -1;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();
    this.buscarProvincias();
    this.buscarCategorias();

    if (this.esConsulta && this.usuario) {
      this.rellenarFormularioDataUsuario();
    }

    this.tieneProvincia();
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', [Validators.required, Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)]],
      txApellido: ['', [Validators.required, Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)]],
      txMail: ['', [Validators.required, this.emailValidator()]],
      txCondicionIva: ['', [Validators.required]],
      txFechaNacimiento: ['', [this.fechaMenorQueHoy()]],
      txCodigoPostal: ['', [Validators.pattern(/^[0-9]+$/)]],
      txDNI: ['', [Validators.maxLength(8), Validators.pattern(/^[0-9]+$/)]],
      txCUIT: ['', [Validators.maxLength(11)]],
      ddGenero: ['', []],
      txProvincia: ['', [Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)]],
      txLocalidad: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, [Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)]],
      txCalle: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, []],
      txNumero: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, [Validators.pattern(/^[0-9]+$/)]],
    });
  }

  public habilitarEdicion(){
    this.form.enable();
    this.data.editar = true;
    this.tieneProvincia();
  }

  // Validar que la fecha de nacimiento sea menor a la de hoy
  fechaMenorQueHoy(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        // Si el campo está vacío o nulo, no se realiza ninguna validación (es opcional).
        return null;
      }
      const today = new Date();
      const birthDate = new Date(control.value);
      return birthDate < today ? null : { 'fechaInvalida': true };
    };
  }

  private rellenarFormularioDataUsuario() {
    this.txNombre.setValue(this.usuario.nombre);
    this.txApellido.setValue(this.usuario.apellido);
    this.txMail.setValue(this.usuario.mail);
    this.txFechaNacimiento.setValue(this.formatDate(this.usuario.fechaNacimiento));
    this.txCodigoPostal.setValue(this.usuario.codigoPostal);
    this.txDNI.setValue(this.usuario.dni);
    this.txCUIT.setValue(this.usuario.cuit);
    this.ddGenero.setValue(this.usuario.idGenero);
    this.txProvincia.setValue(this.usuario.domicilio?.localidad?.provincia?.nombre);
    this.txLocalidad.setValue(this.usuario.domicilio?.localidad?.nombre);
    this.txCalle.setValue(this.usuario.domicilio?.calle);
    this.txNumero.setValue(this.usuario.domicilio?.numero);

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

    if (this.usuario.cuit) {
      this.pedirCUIT = true;
    }

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  formatDate(fecha: Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
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

  private buscarCategorias() {
    this.ventaServive.buscarCategorias().subscribe((categorias) => {
      if (categorias.length > 0) {
        this.condicionesIva = categorias;
        if (this.usuario) {
          this.txCondicionIva.setValue(this.usuario.idCondicionIva);
        } else {
          this.txCondicionIva.setValue(3);
        }
      }
    });
  }

  private buscarProvincias(){
    this.domicilioService.obtenerProvincias().subscribe((provincias) => {
      this.listaProvincias = provincias;
      this.txProvincia.valueChanges.subscribe((provincia) => {
        this.provinciasFiltradas = this.filterProvincias(provincia);
      });
    });
  }

  private tieneProvincia() {
    if (this.data.editar && !this.usuario.domicilio?.localidad?.provincia?.id) {
      this.txLocalidad.disable();
      this.txCalle.disable();
      this.txNumero.disable();
    }
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

  public cancelar() {
    this.dialogRef.close();
  }

  public registrarNuevoCliente(){
    if (this.form.valid) {
      const cliente: Usuario = new Usuario();
      const domicilio: Domicilio = new Domicilio();
      const tipoUsuario: TipoUsuario = new TipoUsuario();
      cliente.nombre = this.txNombre.value;
      cliente.apellido = this.txApellido.value;
      cliente.fechaNacimiento = this.txFechaNacimiento.value;
      cliente.codigoPostal = this.txCodigoPostal.value;
      cliente.dni = this.txDNI.value;
      cliente.cuit = this.txCUIT.value;
      cliente.idGenero = this.ddGenero.value;
      cliente.domicilio = domicilio;
      cliente.domicilio.localidad.id = this.idLocalidad;
      cliente.domicilio.calle = this.txCalle.value;
      cliente.domicilio.numero = this.txNumero.value;
      cliente.mail = this.txMail.value;
      cliente.tipoUsuario = tipoUsuario;
      cliente.tipoUsuario.id = 2;
      cliente.idCondicionIva = this.txCondicionIva.value;

      this.isLoading = true;
      this.form.disable();

      this.usuariosService.registrarUsuario(cliente).subscribe((respuesta: SpResult) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('El cliente se registró con éxito');
          cliente.id = respuesta.id!;
          this.isLoading = false;
          this.form.enable();
          this.dialogRef.close(cliente);
        } else {
          this.notificacionService.openSnackBarError('Error al registrar el cliente, inténtelo nuevamente');
          this.isLoading = false;
          this.form.enable();
        }
      })
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

  public modificarCliente() {
    if (this.form.valid) {
      const domicilio: Domicilio = new Domicilio();
      const tipoUsuario: TipoUsuario = new TipoUsuario();
      this.usuario.nombre = this.txNombre.value;
      this.usuario.apellido = this.txApellido.value;
      this.usuario.mail = this.txMail.value;
      this.usuario.fechaNacimiento = this.txFechaNacimiento.value;
      this.usuario.codigoPostal = this.txCodigoPostal.value;
      this.usuario.dni = this.txDNI.value;
      this.usuario.cuit = this.txCUIT.value;
      this.usuario.idGenero = this.ddGenero.value;
      this.usuario.domicilio = domicilio;
      this.usuario.domicilio.localidad.id = this.idLocalidad;
      this.usuario.domicilio.calle = this.txCalle.value;
      this.usuario.domicilio.numero = this.txNumero.value;
      this.usuario.tipoUsuario = tipoUsuario;
      this.usuario.tipoUsuario.id = 2;
      this.usuario.idCondicionIva = this.txCondicionIva.value;

      this.usuariosService.modificarUsuario(this.usuario).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Cliente modificado con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar el cliente');
        }
      })
    }
  }

  public pedirCuit(id: number) {
    this.pedirCUIT = id == 1 || id == 2;
  }

  // Getters

  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txApellido(): FormControl {
    return this.form.get('txApellido') as FormControl;
  }

  get txMail(): FormControl {
    return this.form.get('txMail') as FormControl;
  }

  get txCondicionIva(): FormControl {
    return this.form.get('txCondicionIva') as FormControl;
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

  get txCUIT(): FormControl {
    return this.form.get('txCUIT') as FormControl;
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
