import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.component.html',
  styleUrl: './registrar-proveedor.component.scss'
})
export class RegistrarProveedorComponent implements OnInit{

  public form: FormGroup;

  constructor(private fb: FormBuilder) {
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

  public registrarProveedor() {}

  public cancelar() {}

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
