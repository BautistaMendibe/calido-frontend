import { Component, Inject, OnInit } from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
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
import {Promocion} from "../../../models/promociones.model";
import {PromocionesService} from "../../../services/promociones.service";
import {FiltrosPromociones} from "../../../models/comandos/FiltrosPromociones.comando";

@Component({
  selector: 'app-registrar-producto',
  templateUrl: './registrar-producto.component.html',
  styleUrls: ['./registrar-producto.component.scss']
})
export class RegistrarProductoComponent implements OnInit {

  public form: FormGroup;
  private referencia: ConsultarProductosComponent;
  public listaTipoProducto: TipoProducto[] = [];
  public tiposProductoFiltrados: TipoProducto[] = [];
  public listaProveedores: Proveedor[] = [];
  public listaMarcas: Marca[] = [];
  public marcasFiltradas: Marca[] = [];
  public productoImg: string | ArrayBuffer | null = null;
  private selectedFile: File | null = null;
  public esConsulta: boolean;
  public listaPorcentajesGanancia: { value: number, label: string }[] = [];
  public editarPrecioDeVenta: boolean = false;
  public promociones: Promocion[] = [];

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private promocionesService: PromocionesService,
    private marcasService: MarcasService,
    private proveedoresService: ProveedoresService,
    private dialogRef: MatDialogRef<RegistrarProductoComponent>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarProductosComponent;
      producto: Producto;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      editarPrecioDeVenta: boolean
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.productoImg = this.data.producto?.imgProducto || null;
    this.esConsulta = this.data.esConsulta;
    this.editarPrecioDeVenta = this.data.editarPrecioDeVenta;
  }

  ngOnInit() {
    this.crearFormulario();

    if (this.data.formDesactivado) {
      this.form.disable();

      // Solo permitir modificar precio de ser necesario
      if (this.editarPrecioDeVenta) {
        this.txCosto.enable();
      }
    }

    this.buscarTiposProductos();
    this.buscarMarcas();
    this.buscarProveedores();
    this.buscarPromocionPorProducto();

    this.form.get('txCosto')?.valueChanges.subscribe(() => this.calcularCostoFinalSinIva());
    this.form.get('txMargenGanancia')?.valueChanges.subscribe(() => this.calcularCostoFinalSinIva());
    this.form.get('txPromocion')?.valueChanges.subscribe(() => this.calcularCostoFinalSinIva());
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: [this.data.producto?.nombre || '', [Validators.required, Validators.pattern('^[^0-9]+$')]],
      txCodigoBarras: [this.data.producto?.codigoBarra || '', [Validators.required, Validators.maxLength(13)]],
      txCosto: [Number(this.data.producto?.costo) || '', [Validators.required, Validators.pattern('^[0-9]+$')]],
      txTipoProducto: [this.data.producto?.tipoProducto?.nombre || '', [Validators.pattern('^[^0-9]+$')]],
      txMarca: [this.data.producto?.marca?.nombre || '', [Validators.pattern('^[^0-9]+$')]],
      txProveedor: [this.data.producto?.proveedor?.id || '', [Validators.required]],
      txMargenGanancia: [this.data.producto?.margenGanancia, [Validators.required, Validators.min(0), Validators.max(100)]], // Margen por defecto: 10%
      txPrecioSinIva: [{ value: this.data.producto?.precioSinIVA, disabled: true }, [Validators.required]],
      txPrecioConIva: [{ value: this.data.producto?.precioSinIVA, disabled: true }, [Validators.required]],
      txDescripcion: [this.data.producto?.descripcion || '', [Validators.maxLength(200)]],
      txPromocion: [this.data.producto?.promocion?.id, []],
    });
  }

  private calcularCostoFinalSinIva() {
    const costo = parseFloat(this.txCosto.value) || 0;
    const margenGanancia = parseFloat(this.txMargenGanancia.value) || 0;
    const promocion = this.promociones.find((promocion) => promocion.id == this.txPromocion.value);
    const porcentajeDescuento: number = promocion ? promocion.porcentajeDescuento : 0;

    const costoFinal = costo * (1 + margenGanancia / 100) * (1 - porcentajeDescuento / 100);
    this.txPrecioSinIva.setValue(costoFinal.toFixed(2), { emitEvent: false });
  }

  private buscarTiposProductos() {
    this.productosService.buscarTiposProductos().subscribe((tipoProductos) => {
      this.listaTipoProducto = tipoProductos;
      this.txTipoProducto.valueChanges.subscribe((tipoProducto) => {
        this.tiposProductoFiltrados = this.filtrarLista(tipoProducto, this.listaTipoProducto);
      });
    });
  }

  private buscarMarcas() {
    this.marcasService.buscarMarcas().subscribe((marcas) => {
      this.listaMarcas = marcas;
      this.txMarca.valueChanges.subscribe((marca) => {
        this.marcasFiltradas = this.filtrarLista(marca, this.listaMarcas);
      });
    });
  }

  private buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedores = proveedores;
    });
  }

  private buscarPromocionPorProducto() {
    const filtroPromocion: FiltrosPromociones = new FiltrosPromociones();

    this.promocionesService.consultarPromociones(filtroPromocion).subscribe((promociones) => {
      const promocion: Promocion = new Promocion();
      promocion.id = -1;
      promocion.nombre = 'Ninguno';
      promocion.porcentajeDescuento = 0;
      this.promociones.push(promocion);

      this.promociones = [promocion, ...promociones];

      if (!this.data.producto.promocion?.id) {
        this.txPromocion.setValue(promocion.id);
      }
    });
  }

  private filtrarLista(busqueda: string, lista: any[]): any[] {
    return lista.filter((value) => value.nombre.toLowerCase().startsWith(busqueda.toLowerCase()));
  }

  public registrarProducto() {
    if (this.form.valid) {
      const producto = this.construirProducto();
      this.productosService.registrarProducto(producto).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'El producto se registró con éxito');
      });
    }
  }

  public modificarProducto() {
    if (this.form.valid) {
      const producto = this.construirProducto(this.data.producto?.id);
      if (!this.editarPrecioDeVenta) {
        this.productosService.modificarProducto(producto).subscribe((respuesta) => {
          this.gestionarRespuesta(respuesta, 'El producto se modificó con éxito');
        });
      } else {
        this.dialogRef.close(producto);
      }
    }
  }

  private construirProducto(id?: number): Producto {
    return {
      id: id || undefined,
      nombre: this.txNombre.value,
      costo: parseFloat(this.txCosto.value) || 0,
      precioSinIVA: parseFloat(this.txPrecioSinIva.value) || 0,
      descripcion: this.txDescripcion.value,
      codigoBarra: this.txCodigoBarras.value,
      imgProducto: this.productoImg as string,
      tipoProducto: { nombre: this.txTipoProducto.value, id: this.getTipoProductoId(this.txTipoProducto.value) },
      marca: { nombre: this.txMarca.value, id: this.getMarcaId(this.txMarca.value) },
      proveedor: { id: this.txProveedor.value },
      margenGanancia: parseFloat(this.txMargenGanancia.value) || 0,
    } as Producto;
  }

  private gestionarRespuesta(respuesta: any, mensajeExito: string) {
    if (respuesta.mensaje === 'OK') {
      this.notificacionService.openSnackBarSuccess(mensajeExito);
      this.dialogRef.close(true);
    } else {
      this.notificacionService.openSnackBarError('Error al procesar la solicitud, intentelo nuevamente');
    }
  }

  private getTipoProductoId(nombre: string): number {
    return this.listaTipoProducto.find(tp => tp.nombre === nombre)?.id || 0;
  }

  private getMarcaId(nombre: string): number {
    return this.listaMarcas.find(m => m.nombre === nombre)?.id || 0;
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public habilitarEdicion(){
    this.form.enable();
    this.txPrecioSinIva.disable();
    this.txPrecioConIva.disable();
    this.data.formDesactivado = false;
    this.data.editar = true;
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('pattern')) return 'Formato inválido';
    return '';
  }

  public onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files?.length) {
      this.selectedFile = fileInput.files[0];
      this.handleFileInput(this.selectedFile);
    }
  }

  private handleFileInput(file: File) {
    if (!this.validateImage(file)) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.productoImg = reader.result;
      this.convertirImagenABase64(this.productoImg as string);
    };
    reader.readAsDataURL(file);
  }

  private convertirImagenABase64(base64Image: string) {
    this.productoImg = base64Image;
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

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) {
      this.previewImage(event.dataTransfer.files[0]);
    }
  }

  private previewImage(file: File): void {
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

  get txPrecioSinIva(): FormControl {
    return this.form.get('txPrecioSinIva') as FormControl;
  }

  get txDescripcion(): FormControl {
    return this.form.get('txDescripcion') as FormControl;
  }

  get txCodigoBarras(): FormControl {
    return this.form.get('txCodigoBarras') as FormControl;
  }

  get txMargenGanancia(): FormControl {
    return this.form.get('txMargenGanancia') as FormControl;
  }

  get txPrecioConIva(): FormControl {
    return this.form.get('txPrecioConIva') as FormControl;
  }

  get txPromocion(): FormControl {
    return this.form.get('txPromocion') as FormControl;
  }

}
