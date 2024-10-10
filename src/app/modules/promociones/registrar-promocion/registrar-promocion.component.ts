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
  public listaProductos: Producto[] = [];
  public productosSelecionados: Producto[] = [];
  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public columnas: string[] = ['imgProducto', 'producto', 'precio', 'seleccionar'];
  public isLoading: boolean = false;
  public promocion: Promocion;


  constructor(
    private fb: FormBuilder,
    private promocionesService: PromocionesService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {
      promocion: Promocion,
    }
  ) {
    this.form = new FormGroup({});
    this.promocion = this.data.promocion;
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

    if (this.promocion) {
      this.setearDatos();
    }
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
      txBuscar: ['', []],
    });
  }

  private buscarProductos(){
    this.isLoading = true;
    this.promocionesService.buscarProductos().subscribe((productos) => {
      this.listaProductos = productos;

      if (this.promocion) {
        this.identificarYActualizarProductosSeleccionados();
      }

      this.tableDataSource.data = this.listaProductos;
      this.isLoading = false;
    });
  }

  private setearDatos() {
    this.txNombre.setValue(this.promocion.nombre);
    this.txPorcentajeDescuento.setValue(this.promocion.porcentajeDescuento);
    this.productosSelecionados = this.promocion.productos;
    this.form.disable();
  }

  private identificarYActualizarProductosSeleccionados() {
    const productosSeleccionadosIds = this.productosSelecionados.map(p => p.id);
    this.listaProductos.forEach(producto => {
      if (productosSeleccionadosIds.includes(producto.id)) {
        producto.estaEnPromocion = true;
      }
    });

    console.log(this.listaProductos);
  }

  public seleccionarProducto(producto: Producto) {
    const index = this.productosSelecionados.findIndex(p => p.id === producto.id);
    if (index > -1) {
      this.productosSelecionados.splice(index, 1);
      producto.estaEnPromocion = false;
    } else {
      this.productosSelecionados.push(producto);
      producto.estaEnPromocion = true;
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

      if (this.productosSelecionados.length == 0) {
        this.notificacionService.openSnackBarError('Debe seleccionar al menos un producto para la promoción.');
        return;
      }

      const promocion: Promocion = new Promocion();
      promocion.nombre = this.txNombre.value;
      promocion.porcentajeDescuento = this.txPorcentajeDescuento.value;
      promocion.productos = this.productosSelecionados;

      this.promocionesService.registrarPromocion(promocion).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La promoción se registró con éxito');
          this.dialogRef.close(true);
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
