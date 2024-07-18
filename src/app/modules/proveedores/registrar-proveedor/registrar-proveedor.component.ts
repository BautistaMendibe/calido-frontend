import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Proveedor} from "../../../models/proveedores.model";
import {ProveedoresService} from "../../../services/proveedores.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarProveedoresComponent} from "../consultar-proveedores/consultar-proveedores.component";
import {TipoProveedor} from "../../../models/tipoProveedor.model";
import {Provincia} from "../../../models/provincia.model";
import {DomicilioService} from "../../../services/domicilio.service";

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.component.html',
  styleUrl: './registrar-proveedor.component.scss'
})
export class RegistrarProveedorComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarProveedoresComponent;
  public listaTiposProveedores: TipoProveedor[] = [];
  public listaProvincias: Provincia[] = [];
  public provinciasFiltradas: Provincia[] = [];

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private domicilioService: DomicilioService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarProveedoresComponent
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProvincias();
    this.buscarTiposProveedores();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txTipoProveedor: ['', []],
      txNombre: ['', [Validators.required]],
      txTelefono: ['', []],
      txEmail: ['', []],
      txCuit: ['', []],
      txProvincia: [ '', []],
      txLocalidad: [ {value: '', disabled: true}, []],
      txCalle: [{value: '', disabled: true}, []],
      txNumero: [{value: '', disabled: true}, []],
    });
  }

  private buscarProvincias(){
    this.domicilioService.obtenerProvincias().subscribe((provincias) => {
      this.listaProvincias = provincias;
      // TODO: Poner validador de estar en lista
      this.txProvincia.valueChanges.subscribe((provincia) => {
        this.provinciasFiltradas = this.filterProvincias(provincia);
      });
    });
  }

  private buscarTiposProveedores() {
    this.proveedoresService.buscarTiposProveedores().subscribe((tiposProveedores) => {
      this.listaTiposProveedores = tiposProveedores;
      this.txTipoProveedor.setValue(tiposProveedores[0].id);
    });
  }

  public registrarProveedor() {
    if (this.form.valid) {
      const proveedor: Proveedor = new Proveedor();
      const tipoProveedor: TipoProveedor = new TipoProveedor();
      proveedor.tipoProveedor =  tipoProveedor;
      proveedor.tipoProveedor.id = this.txTipoProveedor.value;
      proveedor.nombre = this.txNombre.value;
      proveedor.telefono = this.txTelefono.value;
      proveedor.email = this.txEmail.value;
      proveedor.cuit = this.txCuit.value;

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

  public cancelar() {
    this.dialogRef.close();
  }

  filterProvincias(busqueda: string) {
    return this.listaProvincias.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
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
