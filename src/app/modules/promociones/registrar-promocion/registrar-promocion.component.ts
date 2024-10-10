import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Promocion} from "../../../models/promociones.model";
import {PromocionesService} from "../../../services/promociones.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ConsultarPromocionesComponent} from "../consultar-promociones/consultar-promociones.component";
import {Producto} from "../../../models/producto.model";
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-registrar-promocion',
  templateUrl: './registrar-promocion.component.html',
  styleUrl: './registrar-promocion.component.scss'
})
export class RegistrarPromocionComponent implements OnInit{

  public form: FormGroup;
  private referencia: ConsultarPromocionesComponent;
  public listaProductos: Producto[] = [];
  public productosFiltrados: Producto[] = [];
  private idProductoSeleccionado: number = -1;

  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public columnas: string[] = ['imgProducto', 'producto', 'precio', 'seleccionar'];
  public isLoading: boolean = false;


  constructor(
    private fb: FormBuilder,
    private promocionesService: PromocionesService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
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
    });
  }

  /**
   * Valida que un campo mat-autocomplete sea un objeto válido dentro de
   * la lista de productos y no un string cualquiera.
   * @param productos Lista de productos a comparar
   */
  private esProductoValido(productos: Producto[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { productoInvalido: true };
      }
      const productoValido = productos.some(producto => producto.nombre === control.value);
      return productoValido ? null : { productoInvalido: true };
    };
  }

  private buscarProductos(){
    this.isLoading = true;
    this.promocionesService.buscarProductos().subscribe((productos) => {
      this.listaProductos = productos;
      this.tableDataSource.data = productos;
      this.isLoading = false;
      // Valida que el producto seleccionado sea un producto válido.
      //this.txProducto.setValidators([Validators.required, this.esProductoValido(this.listaProductos)]);
      //this.txProducto.updateValueAndValidity();
      //this.txProducto.valueChanges.subscribe((producto) => {
      //  this.productosFiltrados = this.filterProductos(producto);
      //});
    });
  }

  filterProductos(busqueda: string) {
    return this.listaProductos.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
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

  /*
  * Método que se ejecuta cuando el usuario selecciona un producto de la lista
  * del mat-autocomplete. Guarda el id del producto seleccionado en la variable global.
   */
  enSeleccionDeProducto(event: any) {
    this.idProductoSeleccionado = event.option.id;
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

  get txProducto(): FormControl {
    return this.form.get('txProducto') as FormControl;
  }


}
