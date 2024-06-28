import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";

@Component({
  selector: 'app-consultar-empleados',
  templateUrl: './consultar-empleados.component.html',
  styleUrl: './consultar-empleados.component.scss'
})
export class ConsultarEmpleadosComponent implements OnInit {

  public form: FormGroup;
  // Ver. Crear tabla empleados que cada uno tenga un usuario
  public empleados: Usuario[] = [];

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      txNombre: ['', []],
      txApellido: ['', []],
      txDNI: ['', []],
      txGenero: ['', []],
    });
  }

  public limpiarFiltros() {}

  public buscar() {}

  // Regios getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txApellido(): FormControl {
    return this.form.get('txApellido') as FormControl;
  }

  get txDNI(): FormControl {
    return this.form.get('txDNI') as FormControl;
  }

  get txGenero(): FormControl {
    return this.form.get('txGenero') as FormControl;
  }

}
