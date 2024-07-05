import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Proveedor} from "../../../models/proveedores.model";
import {ProveedoresService} from "../../../services/proveedores.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.component.html',
  styleUrl: './registrar-proveedor.component.scss'
})
export class RegistrarProveedorComponent implements OnInit{

  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private dialogRef: MatDialogRef<any>) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProvincias();
  }

  private crearFormulario() {
    this.form = this.fb.group({
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

  public registrarProveedor() {

    if (this.form.valid) {
      const proveedor: Proveedor = new Proveedor();
      proveedor.nombre = this.txNombre.value;
      proveedor.telefono = this.txTelefono.value;
      proveedor.email = this.txEmail.value;
      proveedor.cuit = this.txCuit.value;

      this.proveedoresService.registrarProveedor(proveedor).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          // Mostrar notificacion exitosa
          // Volver a cargar la pantalla de consulta
        } else {
          // Mostrar notificacion error
        }
      })

    }

  }

  public cancelar() {
    this.dialogRef.close();
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
