import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Proveedor} from "../../../models/proveedores.model";
import {ProveedoresService} from "../../../services/proveedores.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarProveedoresComponent} from "../consultar-proveedores/consultar-proveedores.component";
import {TipoProveedor} from "../../../models/tipoProveedor.model";
import {Provincia} from "../../../models/provincia.model";
import {DomicilioService} from "../../../services/domicilio.service";
import {Localidad} from "../../../models/localidad.model";
import {Domicilio} from "../../../models/domicilio.model";
import {firstValueFrom} from "rxjs";

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.component.html',
  styleUrl: './registrar-proveedor.component.scss'
})
export class RegistrarProveedorComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarProveedoresComponent;
  private idProvincia: number;
  private idLocalidad: number;
  public listaTiposProveedores: TipoProveedor[] = [];
  public listaProvincias: Provincia[] = [];
  public provinciasFiltradas: Provincia[] = [];
  public listaLocalidades: Localidad[] = [];
  public localidadesFiltradas: Localidad[] = [];
  public proveedor: Proveedor;
  public esConsulta: boolean;
  public formDesactivado: boolean;

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private domicilioService: DomicilioService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarProveedoresComponent;
      proveedor: Proveedor;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.proveedor = this.data.proveedor;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
    this.idProvincia = -1;
    this.idLocalidad = -1;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProvincias();
    this.buscarTiposProveedores();

    if (this.esConsulta && this.proveedor) {
      this.rellenarFormularioDataProveedor();
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txTipoProveedor: ['', []],
      txNombre: ['', [Validators.required]],
      txTelefono: ['', []],
      txEmail: ['', [this.emailValidator()]],
      txCuit: ['', []],
      txProvincia: [ '', [Validators.required]],
      txLocalidad: [ {value: '', disabled: (!this.esConsulta || this.formDesactivado)}, [Validators.required]],
      txCalle: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, [Validators.required]],
      txNumero: [{value: '', disabled: (!this.esConsulta || this.formDesactivado)}, [Validators.required]],
    });
  }

  private rellenarFormularioDataProveedor() {
    this.txTipoProveedor.setValue(this.proveedor.tipoProveedor.id);
    this.txNombre.setValue(this.proveedor.nombre);
    this.txTelefono.setValue(this.proveedor.telefono);
    this.txEmail.setValue(this.proveedor.email);
    this.txCuit.setValue(this.proveedor.cuit);
    this.txProvincia.setValue(this.proveedor.domicilio?.localidad?.provincia.nombre);
    this.txLocalidad.setValue(this.proveedor.domicilio?.localidad?.nombre);
    this.txCalle.setValue(this.proveedor.domicilio?.calle);
    this.txNumero.setValue(this.proveedor.domicilio?.numero);

    if (this.proveedor.domicilio?.localidad?.provincia?.id) {
      this.obtenerLocalidadesPorProvincia(this.proveedor.domicilio.localidad.provincia.id)
        .then(() => {
          this.localidadesFiltradas = this.filterLocalidades(this.proveedor.domicilio.localidad.nombre);
          return this.buscarIdLocalidad(this.proveedor.domicilio.localidad.nombre);
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

  public async obtenerLocalidadesPorProvincia(idProvincia: number): Promise<Localidad[]> {
    return firstValueFrom(this.domicilioService.obtenerLocalidadesPorProvincia(idProvincia))
      .then((localidades) => {
        this.listaLocalidades = localidades;
        return localidades;
      });
  }

    private buscarTiposProveedores() {
      this.proveedoresService.buscarTiposProveedores().subscribe((tiposProveedores) => {
        this.listaTiposProveedores = tiposProveedores;

        // Si no hay un proveedor para consultar pone el tipo 'Mayorista' por default
        if (!this.proveedor) {
          this.txTipoProveedor.setValue(tiposProveedores[0].id);
        }
      });
    }

  public registrarProveedor() {
    if (this.form.valid) {
      // Armamos el objeto Proveedor con todos los atributos
      const proveedor: Proveedor = new Proveedor();
      const tipoProveedor: TipoProveedor = new TipoProveedor();
      const domicilio: Domicilio = new Domicilio();
      proveedor.tipoProveedor =  tipoProveedor;
      proveedor.tipoProveedor.id = this.txTipoProveedor.value;
      proveedor.nombre = this.txNombre.value;
      proveedor.telefono = this.txTelefono.value;
      proveedor.email = this.txEmail.value;
      proveedor.cuit = this.txCuit.value;
      proveedor.domicilio = domicilio;
      proveedor.domicilio.localidad.id =  this.idLocalidad;
      proveedor.domicilio.calle = this.txCalle.value;
      proveedor.domicilio.numero = this.txNumero.value;

      this.proveedoresService.registrarProveedor(proveedor).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('El proveedor se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar un proveedor, intentelo nuevamente');
        }
      });
    }
  }

  public modificarProveedor() {
    if (this.form.valid) {

      this.proveedor.tipoProveedor.id = this.txTipoProveedor.value;
      this.proveedor.nombre = this.txNombre.value;
      this.proveedor.telefono = this.txTelefono.value;
      this.proveedor.email = this.txEmail.value;
      this.proveedor.cuit = this.txCuit.value;
      this.proveedor.domicilio.localidad.id =  this.idLocalidad;
      this.proveedor.domicilio.calle =  this.txCalle.value;
      this.proveedor.domicilio.numero =  this.txNumero.value;

      this.proveedoresService.modificarProveedor(this.proveedor).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Proveedor modificado con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar el proveedor');
        }
      })
    }
  }

  public cancelar() {
    this.dialogRef.close();
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
      texto ? texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()  : '';

    const busquedaNormalizada = normalizarTexto(busqueda);

    return this.listaLocalidades.filter((value) =>
      normalizarTexto(value.nombre).includes(busquedaNormalizada)
    );
  }

  // Regios getters
  get txTipoProveedor(): FormControl {
    return this.form.get('txTipoProveedor') as FormControl;
  }

  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txTelefono(): FormControl {
    return this.form.get('txTelefono') as FormControl;
  }

  get txEmail(): FormControl {
    return this.form.get('txEmail') as FormControl;
  }

  get txCuit(): FormControl {
    return this.form.get('txCuit') as FormControl;
  }

  get txCalle(): FormControl {
    return this.form.get('txCalle') as FormControl;
  }

  get txNumero(): FormControl {
    return this.form.get('txNumero') as FormControl;
  }

  get txProvincia(): FormControl {
    return this.form.get('txProvincia') as FormControl;
  }

  get txLocalidad(): FormControl {
    return this.form.get('txLocalidad') as FormControl;
  }


}
