import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Proveedor} from "../../../models/proveedores.model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ProveedoresService} from "../../../services/proveedores.service";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarProveedoresComponent} from "../consultar-proveedores/consultar-proveedores.component";

@Component({
  selector: 'app-detalle-proveedor',
  templateUrl: './detalle-proveedor.component.html',
  styleUrl: './detalle-proveedor.component.scss'
})
export class DetalleProveedorComponent implements OnInit {

  private proveedor: Proveedor;
  private referencia: ConsultarProveedoresComponent;
  public edit: boolean;
  public form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DetalleProveedorComponent>,
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      proveedor: Proveedor,
      edit: boolean,
      referencia: ConsultarProveedoresComponent
    }
  ) {

    this.proveedor = this.data.proveedor;
    this.edit = this.data.edit;
    this.referencia = this.data.referencia;

    this.form = new FormGroup({});
  }

  ngOnInit() {
    // Buscamos los ultimos pedidos realizados a este provedor segun su id

    this.crearFormulario();

    if (!this.edit) {
      this.deshabilitarFormulario();
    }

  }

  // Creamos el formulario con los datos del proveedor que pasamos como parametro
  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: [this.proveedor.nombre, []],
      txTelefono: [this.proveedor.telefono, []],
      txEmail: [this.proveedor.email, []],
      txCuit: [this.proveedor.cuit, []],
      //txCalle: [this.proveedor.domicilio.calle, []],
      //txNumero: [this.proveedor.domicilio.numero, []],
      //txProvincia: [this.proveedor.domicilio.provincia, []],
      txCalle: ['', []],
      txNumero: ['', []],
      txProvincia: ['', []],
    });
  }

  public habilitarEdicion() {
    this.edit = true;
    this.habilitarFormulario();
  }


  public cancelar() {
    this.dialogRef.close();
  }

  public modificarProveedor() {
    const proveedor: Proveedor = new Proveedor();

    proveedor.id = this.proveedor.id;
    proveedor.nombre = this.txNombre.value;
    proveedor.email = this.txEmail.value;
    proveedor.cuit = this.txCuit.value;
    proveedor.telefono = this.txTelefono.value;

    // const domicilio = new Domicilio();
    // const provincia = new Provincia();
    // provincia.nombre = this.txProvincia.value
    // domicilio.provincia = provincia;
    // proveedor.domicilio = domicilio;

    this.proveedoresService.modificarProveedor(proveedor).subscribe((res) => {
      if (res.mensaje == 'OK') {
        this.notificacionService.openSnackBarSuccess('Proveedor moficado con éxito');
        this.dialogRef.close();
        this.referencia.buscar();
      } else {
        this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar el proveedor');
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
