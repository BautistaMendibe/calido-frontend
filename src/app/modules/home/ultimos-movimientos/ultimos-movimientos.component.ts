import {Component, ElementRef, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UltimosMovimientosComando} from "../../../models/comandos/dashboard/UltimosMovimientos.comando";
import {UsuariosService} from "../../../services/usuarios.service";

@Component({
  selector: 'app-ultimos-movimientos',
  templateUrl: './ultimos-movimientos.component.html',
  styleUrl: './ultimos-movimientos.component.scss'
})
export class UltimosMovimientosComponent implements OnInit {

  public form: FormGroup;
  public ultimosMovimientos: UltimosMovimientosComando[] = [];
  public movimientosFiltrados: UltimosMovimientosComando[] = [];
  public buscando: boolean = false;

  constructor(private fb: FormBuilder, private usuariosService: UsuariosService) {
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
    this.buscando = true;
    this.usuariosService.buscarUltimosMovimientos().subscribe((ultimosMovs) => {
      this.ultimosMovimientos = ultimosMovs;
      this.movimientosFiltrados = [...this.ultimosMovimientos];
      this.buscando = false;
    });
  }

  private agregarFiltro() {
    this.txBuscar.valueChanges.subscribe((valor: string) => {
      this.movimientosFiltrados = this.ultimosMovimientos.filter(movimiento =>
        movimiento.nombre.toLowerCase().includes(valor.toLowerCase()) ||
        movimiento.codigo.toString().includes(valor)
      );
    });
  }


  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }
}
