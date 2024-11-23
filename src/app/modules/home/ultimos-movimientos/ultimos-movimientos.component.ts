import {Component, ElementRef, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UltimosMovimientosComando} from "../../../models/comandos/dashboard/UltimosMovimientos.comando";

@Component({
  selector: 'app-ultimos-movimientos',
  templateUrl: './ultimos-movimientos.component.html',
  styleUrl: './ultimos-movimientos.component.scss'
})
export class UltimosMovimientosComponent implements OnInit {

  public form: FormGroup;
  public ultimosMovimientos: UltimosMovimientosComando[] = [];
  public movimientosFiltrados: UltimosMovimientosComando[] = [];

  constructor(private fb: FormBuilder) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.crearForm();
    this.buscarUltimosMovimientos();
    this.agregarFiltro();
  }

  private crearForm() {
    this.form = this.fb.group({
      txBuscar: ['', []],
    });
  }

  private buscarUltimosMovimientos() {
    this.ultimosMovimientos = [
      { hora: '12:30', cantidad: 0, tipo: 'Orden de compra', dia: '23/11', icon: 'receipt', codigo: 443 },
      { hora: '11:30', cantidad: 12334, tipo: 'Venta', dia: '23/11', icon: 'loyalty', codigo: 342 },
      { hora: '11:25', cantidad: 13334, tipo: 'Venta', dia: '23/11', icon: 'loyalty', codigo: 343 },
      { hora: '11:10', cantidad: 12334, tipo: 'Venta', dia: '23/11', icon: 'loyalty', codigo: 323 },
      { hora: '10:30', cantidad: 34232, tipo: 'Anulación de venta', dia: '23/11', icon: 'settings_backup_restore', codigo: 234 },
    ];

    this.movimientosFiltrados = [...this.ultimosMovimientos];
  }

  private agregarFiltro() {
    this.txBuscar.valueChanges.subscribe((valor: string) => {
      this.movimientosFiltrados = this.ultimosMovimientos.filter(movimiento =>
        movimiento.tipo.toLowerCase().includes(valor.toLowerCase()) ||
        movimiento.codigo.toString().includes(valor)
      );
    });
  }


  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }
}
