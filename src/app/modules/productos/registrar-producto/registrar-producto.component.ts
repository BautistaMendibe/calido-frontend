import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ConsultarProductosComponent } from "../consultar-productos/consultar-productos.component";
import { Proveedor } from "../../../models/proveedores.model";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnackBarService } from "../../../services/snack-bar.service";
import { TipoProducto } from "../../../models/tipoProducto.model";
import { Marca } from "../../../models/Marcas.model";
import { Producto } from "../../../models/producto.model";
import { ProductosService } from "../../../services/productos.service";
import { MarcasService } from "../../../services/marcas.service";
import { ProveedoresService } from "../../../services/proveedores.service";

@Component({
  selector: 'app-registrar-producto',
  templateUrl: './registrar-producto.component.html',
  styleUrls: ['./registrar-producto.component.scss']
})
export class RegistrarProductoComponent implements OnInit {

  public form: FormGroup;
  private referencia: ConsultarProductosComponent;
  private idProducto: number;
  public nombre: string;
  public costo: number;
  public costoIva: number;
  public listaTipoProducto: TipoProducto[] = [];
  public tiposProductoFiltrados: TipoProducto[] = [];
  public listaProveedores: Proveedor[] = [];
  public proveedoresFiltrados: Proveedor[] = [];
  public listaMarcas: Marca[] = [];
  public marcasFiltradas: Marca[] = [];
  public esConsulta: boolean;
  public formDesactivado: boolean;
  public producto: Producto;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private marcasService: MarcasService,
    private proveedoresService: ProveedoresService,
    private dialogRef: MatDialogRef<RegistrarProductoComponent>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarProductosComponent;
      producto: Producto;
      esConsulta: boolean;
      formDesactivado: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.producto = this.data.producto;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
    this.idProducto = this.producto ? this.producto.id : -1;
    this.nombre = this.producto ? this.producto.nombre : '';
    this.costo = this.producto ? this.producto.costo : 0;
    this.costoIva = this.producto ? this.producto.costoIva : 0;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarTiposProductos();
    this.buscarMarcas();
    this.buscarProveedores();

    if (this.esConsulta && this.producto) {
      this.rellenarFormularioDataProducto();
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', [Validators.required, Validators.pattern('^[^0-9]+$')]],
      txCosto: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      txTipoProducto: ['', [Validators.pattern('^[^0-9]+$')]],
      txMarca: ['', [Validators.pattern('^[^0-9]+$')]],
      txProveedor: ['', [Validators.pattern('^[^0-9]+$')]],
    });
  }

  private rellenarFormularioDataProducto() {
    this.form.get('txNombre')?.setValue(this.producto.nombre);
    this.form.get('txCosto')?.setValue(this.producto.costo);
    this.form.get('txTipoProducto')?.setValue(this.producto.tipoProducto.nombre);
    this.form.get('txMarca')?.setValue(this.producto.marca.nombre);
    this.form.get('txProveedor')?.setValue(this.producto.proveedor.nombre);

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  // Obtener TipoProductos
  private buscarTiposProductos() {
    this.productosService.buscarTiposProductos().subscribe((tipoProductos) => {
      this.listaTipoProducto = tipoProductos;
      this.form.get('txTipoProducto')?.valueChanges.subscribe((tipoProducto) => {
        this.tiposProductoFiltrados = this.filterTipoProductos(tipoProducto);
      });
    });
  }

  private filterTipoProductos(busqueda: string) {
    return this.listaTipoProducto.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  // Obtener Marcas
  private buscarMarcas() {
    this.marcasService.buscarMarcas().subscribe((marcas) => {
      this.listaMarcas = marcas;
      this.form.get('txMarca')?.valueChanges.subscribe((marca) => {
        this.marcasFiltradas = this.filterMarcas(marca);
      });
    });
  }

  private filterMarcas(busqueda: string) {
    return this.listaMarcas.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  // Obtener Proveedores
  private buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedores = proveedores;
      this.form.get('txProveedor')?.valueChanges.subscribe((proveedor) => {
        this.proveedoresFiltrados = this.filterProveedores(proveedor);
      });
    });
  }

  private filterProveedores(busqueda: string) {
    return this.listaProveedores.filter((value) => value.nombre.toLowerCase().indexOf(busqueda.toLowerCase()) === 0);
  }

  public registrarProducto() {
    if (this.form.valid) {
      // Armamos el objeto Producto con todos los atributos
      const producto: Producto = new Producto();
      const tipoProducto: TipoProducto = new TipoProducto();
      const marca: Marca = new Marca();
      const proveedor: Proveedor = new Proveedor();

      // Asignamos los valores al objeto Producto
      producto.tipoProducto = tipoProducto;
      producto.tipoProducto.id = this.txTipoProducto.value;
      producto.nombre = this.txNombre.value;
      producto.costo = this.txCosto.value;
      producto.costoIva = this.txCosto.value * 1.21; // Ejemplo para calcular el costo con IVA
      producto.marca = marca;
      producto.marca.id = this.txMarca.value;
      producto.proveedor = proveedor;
      producto.proveedor.id = this.txProveedor.value;

      // Llamamos al servicio para registrar el producto
      this.productosService.registrarProducto(producto).subscribe((respuesta) => {
        if (respuesta.mensaje === 'OK') {
          this.notificacionService.openSnackBarSuccess('El producto se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar el producto, intentelo nuevamente');
        }
      });
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  // Getters para los form controls
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txCosto(): FormControl {
    return this.form.get('txCosto') as FormControl;
  }

  get txTipoProducto(): FormControl {
    return this.form.get('txTipoProducto') as FormControl;
  }

  get txMarca(): FormControl {
    return this.form.get('txMarca') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }

  // Métodos para evitar la entrada de caracteres no válidos
  public soloNumeros(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const pattern = /[a-zA-Z\s]/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }

  // Método para obtener mensajes de error
  public getErrorMessage(control: FormControl): string {
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    } else if (control.hasError('pattern')) {
      return 'Formato inválido';
    }
    return '';
  }
}

