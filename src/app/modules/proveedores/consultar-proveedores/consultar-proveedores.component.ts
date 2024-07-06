import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Proveedor} from "../../../models/proveedores.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {RegistrarProveedorComponent} from "../registrar-proveedor/registrar-proveedor.component";

@Component({
  selector: 'app-consultar-proveedores',
  templateUrl: './consultar-proveedores.component.html',
  styleUrl: './consultar-proveedores.component.scss'
})
export class ConsultarProveedoresComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Proveedor> = new MatTableDataSource<Proveedor>([]);
  public form: FormGroup;
  public proveedores: Proveedor[] = [];
  public columnas: string[] = ['nombre', 'telefono', 'mail', 'direccion'];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.crearFormulario();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', []],
    });
  }

  public limpiarFiltros() {}

  public buscar() {}

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
