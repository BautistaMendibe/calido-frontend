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
  public listaMarcas: Marca[] = [];
  public marcasFiltradas: Marca[] = [];
  public esConsulta: boolean;
  public formDesactivado: boolean;
  public producto: Producto;
  public productoImg: string | ArrayBuffer | null = null;
  private selectedFile: File | null = null;

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
      txProveedor: ['', [Validators.required]],
      txImpuestos: ['21', [Validators.required]], // Valor por defecto IVA
      txCostoFinal: [{value: '', disabled: true}, [Validators.required]],
      txDescripcion: ['']
    });

    // Suscribirse a los cambios en txCosto y txImpuestos
    this.form.get('txCosto')?.valueChanges.subscribe(() => {
      this.calcularCostoFinal();
    });

    this.form.get('txImpuestos')?.valueChanges.subscribe(() => {
      this.calcularCostoFinal();
    });
  }

  private calcularCostoFinal() {
    const costo = this.form.get('txCosto')?.value || 0;
    const impuestos = this.form.get('txImpuestos')?.value || 0;
    const costoFinal = costo * (1 + impuestos / 100);

    this.form.get('txCostoFinal')?.setValue(costoFinal.toFixed(2)); // Actualiza txCostoFinal
  }

  private rellenarFormularioDataProducto() {
    this.idProducto = this.producto.id;
    this.form.get('txNombre')?.setValue(this.producto.nombre);
    this.form.get('txCosto')?.setValue(this.producto.costo);
    this.form.get('txTipoProducto')?.setValue(this.producto.tipoProducto.nombre);
    this.form.get('txMarca')?.setValue(this.producto.marca.nombre);
    this.form.get('txProveedor')?.setValue(this.producto.proveedor.id);

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

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

  private buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedores = proveedores;
    });
  }

  public registrarProducto() {
    if (this.form.valid) {
      const producto: Producto = new Producto();
      const tipoProducto: TipoProducto = new TipoProducto();
      const marca: Marca = new Marca();
      const proveedor: Proveedor = new Proveedor();

      tipoProducto.nombre = this.txTipoProducto.value;
      tipoProducto.id = this.getTipoProductoId(this.txTipoProducto.value);
      marca.nombre = this.txMarca.value;
      marca.id = this.getMarcaId(this.txMarca.value);
      proveedor.id = this.txProveedor.value;

      producto.tipoProducto = tipoProducto;
      producto.nombre = this.txNombre.value;

      const costo = parseFloat(this.txCosto.value);
      producto.costo = costo;
      producto.costoIva = costo * 1.21;
      producto.marca = marca;
      producto.proveedor = proveedor;

      console.log('Producto a registrar:', producto);

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

  private getTipoProductoId(nombre: string): number {
    const tipoProducto = this.listaTipoProducto.find(tp => tp.nombre === nombre);
    return tipoProducto ? tipoProducto.id : 0;
  }

  private getMarcaId(nombre: string): number {
    const marca = this.listaMarcas.find(m => m.nombre === nombre);
    return marca ? marca.id : 0;
  }

  public modificarProducto() {
    if (this.form.valid) {
      const producto: Producto = new Producto();
      const tipoProducto: TipoProducto = new TipoProducto();
      const marca: Marca = new Marca();
      const proveedor: Proveedor = new Proveedor();

      producto.id = this.idProducto;
      tipoProducto.nombre = this.txTipoProducto.value;
      tipoProducto.id = this.getTipoProductoId(this.txTipoProducto.value);
      marca.nombre = this.txMarca.value;
      marca.id = this.getMarcaId(this.txMarca.value);
      proveedor.id = this.txProveedor.value;

      producto.tipoProducto = tipoProducto;
      producto.nombre = this.txNombre.value;

      const costo = parseFloat(this.txCosto.value);
      producto.costo = costo;
      producto.costoIva = costo * 1.21;
      producto.marca = marca;
      producto.proveedor = proveedor;

      console.log('Producto a modificar:', producto);

      this.productosService.modificarProducto(producto).subscribe((respuesta) => {
        if (respuesta.mensaje === 'OK') {
          this.notificacionService.openSnackBarSuccess('El producto se modificó con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al modificar el producto, inténtelo nuevamente');
        }
      });
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

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

  private handleFileInput(file: File) {
    if (!this.validateImage(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.productoImg = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      this.handleFileInput(this.selectedFile);
    }
  }

  private convertirImagenABase64(callback: (logoBase64: string | null) => void) {
    if (!this.selectedFile) {
      callback(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(this.selectedFile);
  }

  private validateImage(file: File): boolean {
    const validTypes = ['image/png', 'image/jpeg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      this.notificacionService.openSnackBarError('El tipo de archivo no es válido. Solo se permiten archivos PNG o JPG.');
      return false;
    }

    if (file.size > maxSize) {
      this.notificacionService.openSnackBarError('El tamaño del archivo es demasiado grande. El tamaño máximo permitido es de 10MB.');
      return false;
    }

    return true;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      this.previewImage(file);
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      this.productoImg = reader.result;
    };

    reader.readAsDataURL(file);
  }

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

  get txImpuestos(): FormControl {
    return this.form.get('txImpuestos') as FormControl;
  }

  get txCostoFinal(): FormControl {
    return this.form.get('txCostoFinal') as FormControl;
  }

  get txDescripcion(): FormControl {
    return this.form.get('txDescripcion') as FormControl;
  }
}


