import {Component, ElementRef, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-ultimos-movimientos',
  templateUrl: './ultimos-movimientos.component.html',
  styleUrl: './ultimos-movimientos.component.scss'
})
export class UltimosMovimientosComponent implements OnInit {

  public form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.crearForm();
  }

  private crearForm() {

  }


  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }
}
