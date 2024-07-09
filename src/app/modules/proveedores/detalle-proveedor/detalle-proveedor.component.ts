import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Proveedor} from "../../../models/proveedores.model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-detalle-proveedor',
  templateUrl: './detalle-proveedor.component.html',
  styleUrl: './detalle-proveedor.component.scss'
})
export class DetalleProveedorComponent implements OnInit {

  private proveedor: Proveedor;
  public edit: boolean;
  public form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DetalleProveedorComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      proveedor: Proveedor,
      edit: boolean
    }
  ) {

    this.proveedor = this.data.proveedor;
    this.edit = this.data.edit;

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
