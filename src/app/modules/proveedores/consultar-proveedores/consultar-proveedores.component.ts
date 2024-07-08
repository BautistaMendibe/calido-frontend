import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Proveedor} from "../../../models/proveedores.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {RegistrarProveedorComponent} from "../registrar-proveedor/registrar-proveedor.component";
import {FiltrosProveedores} from "../../../models/comandos/FiltrosProveedores.comando";
import {ProveedoresService} from "../../../services/proveedores.service";

@Component({
  selector: 'app-consultar-proveedores',
  templateUrl: './consultar-proveedores.component.html',
  styleUrl: './consultar-proveedores.component.scss'
})
export class ConsultarProveedoresComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Proveedor> = new MatTableDataSource<Proveedor>([]);
  public form: FormGroup;
  public proveedores: Proveedor[] = [];
  public columnas: string[] = ['nombre', 'telefono', 'mail'];
  private filtros: FiltrosProveedores;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private proveedoresService: ProveedoresService) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosProveedores();
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.nombre = this.txNombre.value;

    this.proveedoresService.consultarProveedores(this.filtros).subscribe((proveedores) => {
      this.proveedores = proveedores;
      this.tableDataSource.data = proveedores;
    })
  }

  public registrarNuevoProveedor() {
    this.dialog.open(
      RegistrarProveedorComponent,
      {
        width: '75%',
        autoFocus: false,
      }
    )
  }


  // Regios getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

}
