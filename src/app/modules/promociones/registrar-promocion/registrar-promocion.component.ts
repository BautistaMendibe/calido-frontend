import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Promocion} from "../../../models/promociones.model";
import {PromocionesService} from "../../../services/promociones.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarPromocionesComponent} from "../consultar-promociones/consultar-promociones.component";
import {Producto} from "../../../models/producto.model";
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {MatTableDataSource} from "@angular/material/table";
import {BuscarProductosComponent} from "../../productos/buscar-productos/buscar-productos.component";
import {RegistrarProductoComponent} from "../../productos/registrar-producto/registrar-producto.component";

@Component({
  selector: 'app-registrar-promocion',
  templateUrl: './registrar-promocion.component.html',
  styleUrl: './registrar-promocion.component.scss'
})
export class RegistrarPromocionComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarPromocionesComponent;
  public listaProductos: Producto[] = [];
  private idProductoSeleccionado: number = -1;

  public productosSelecionados: Producto[] = [];

  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public columnas: string[] = ['imgProducto', 'producto', 'precio', 'seleccionar'];
  public isLoading: boolean = false;


  constructor(
    private fb: FormBuilder,
    private promocionesService: PromocionesService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarPromocionesComponent
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProductos();

    const filtro = { textoBusqueda: '' };

    // Filtrar por texto de búsqueda
    this.txBuscar.valueChanges.subscribe(valor => {
      filtro.textoBusqueda = valor.trim().toLowerCase();
      this.tableDataSource.filter = filtro.textoBusqueda;

      if (this.tableDataSource.paginator) {
        this.tableDataSource.paginator.firstPage();
      }
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', [Validators.required]],
      txPorcentajeDescuento: ['',
        [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern("^[0-9]*$")
        ]],
      txProducto: ['', [Validators.required]],
      txBuscar: ['', []],
    });
  }

  private buscarProductos(){
    this.isLoading = true;
    this.promocionesService.buscarProductos().subscribe((productos) => {
      this.listaProductos = productos;
      this.tableDataSource.data = productos;
      this.isLoading = false;
    });
  }

  public seleccionarProducto(producto: Producto) {
    const index = this.productosSelecionados.findIndex(p => p.id === producto.id);
    if (index > -1) {
      this.productosSelecionados.splice(index, 1);
    } else {
      this.productosSelecionados.push(producto);
    }
  }

  public registrarNuevoProducto() {
    const dialog = this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        panelClass: 'custom-dialog-container',
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    );

    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.buscarProductos();
      }
    })
  }

  public registrarPromocion() {

    if (this.form.valid) {
      const promocion: Promocion = new Promocion();
      promocion.nombre = this.txNombre.value;
      promocion.porcentajeDescuento = this.txPorcentajeDescuento.value;
      promocion.idProducto = this.idProductoSeleccionado; // Se usa la variable de la clase (id), evitas consultas a BD.

      this.promocionesService.registrarPromocion(promocion).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La promoción se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar una promoción, intentelo nuevamente');
        }
      })

    }

  }

  public cancelar() {
    this.dialogRef.close();
  }

  // Region getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txPorcentajeDescuento(): FormControl {
    return this.form.get('txPorcentajeDescuento') as FormControl;
  }

  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }

}
