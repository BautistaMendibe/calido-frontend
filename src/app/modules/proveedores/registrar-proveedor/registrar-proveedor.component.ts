import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Proveedor} from "../../../models/proveedores.model";
import {ProveedoresService} from "../../../services/proveedores.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarProveedoresComponent} from "../consultar-proveedores/consultar-proveedores.component";
import {TipoProveedor} from "../../../models/tipoProveedor.model";

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.component.html',
  styleUrl: './registrar-proveedor.component.scss'
})
export class RegistrarProveedorComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarProveedoresComponent;
  public listaTiposProveedores: TipoProveedor[] = [];

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
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
      txCalle: ['', []],
      txNumero: ['', []],
      txProvincia: ['', []],
    });
  }

  private buscarProvincias(){
    // TODO: Crear variable provincias: Provincias[]
    //
    // Crear una funcion para retornar las provincias
    // Rellenar el matOption txProvincias

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
      proveedor.tipo.id = this.txTipoProveedor.value;
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
      })

    }

  }

  public cancelar() {
    this.dialogRef.close();
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


}
