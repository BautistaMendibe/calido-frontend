import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ProductosService} from "../../../services/productos.service";
import {ProveedoresService} from "../../../services/proveedores.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {Subject} from "rxjs";

@Component({
  selector: 'app-visualizaciones-compras',
  templateUrl: './visualizaciones-compras.component.html',
  styleUrls: ['./visualizaciones-compras.component.scss']
})
export class VisualizacionesComprasComponent implements OnInit {
  filtersForm: FormGroup;
  private dataLoaded$ = new Subject<boolean>();

  grafanaUrls: {
    gastosPorProducto: SafeResourceUrl;
    gastosPorTipoProducto: SafeResourceUrl;
    comprasPorFechaHora: SafeResourceUrl;
    comprasPorProveedor: SafeResourceUrl;
  } = {
    gastosPorProducto: '',
    gastosPorTipoProducto: '',
    comprasPorFechaHora: '',
    comprasPorProveedor: ''
  };

  proveedoresArray: { id: number; nombre: string }[] = [];

  proveedores: { [id: number]: string } = {
    43: 'María Amores y Asociados',
    44: 'Prit Sould',
    49: 'Nico & Co',
    50: 'Nico Rock',
    51: 'Regulares & Asociados',
    52: 'Proveedor'
  };

  productosArray: { id: number; nombre: string }[] = [];

  productos: { [id: number]: string } = {};

  tiposProductoArray: { id: number; nombre: string }[] = [];

  tiposProducto: { [id: number]: string } = {};

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService) {
    // Inicializa el formulario
    this.filtersForm = this.fb.group({
      start_date: [null],
      end_date: [null],
      proveedor: [''],
      producto: [''],
      tipo_producto: ['']
    });
  }

  ngOnInit(): void {
    this.buscarDatosCombo();
  }

  private buscarDatosCombo() {
    // Crear un contador para llevar la cuenta de las suscripciones completadas
    let completedSubscriptions = 0;
    const totalSubscriptions = 3;

    this.productosService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      // Mapea los productos recibidos a la lista en el formato { [id: number]: string }
      this.productos = productos.reduce((acc, producto) => {
        acc[producto.id] = producto.nombre; // Asigna el nombre al id
        return acc;
      }, {} as { [id: number]: string }); // Asegura el tipo del objeto vacío

      completedSubscriptions++;
      if (completedSubscriptions === totalSubscriptions) {
        this.dataLoaded$.next(true);
      }
    });

    this.productosService.buscarTiposProductos().subscribe((tiposProducto) => {
      this.tiposProducto = tiposProducto.reduce((acc, tipo) => {
        acc[tipo.id] = tipo.nombre; // Asigna el nombre al id
        return acc;
      }, {} as { [id: number]: string }); // Asegura el tipo del objeto vacío

      completedSubscriptions++;
      if (completedSubscriptions === totalSubscriptions) {
        this.dataLoaded$.next(true);
      }
    });

    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores.reduce((acc, proveedor) => {
        acc[proveedor.id] = proveedor.nombre; // Asigna el nombre al id
        return acc;
      }, {} as { [id: number]: string }); // Asegura el tipo del objeto vacío
      completedSubscriptions++;

      if (completedSubscriptions === totalSubscriptions) {
        this.dataLoaded$.next(true);
      }
    });

    // Suscribirse al Subject para ejecutar updateGrafanaUrls() cuando todas las suscripciones se completen
    this.dataLoaded$.subscribe(() => {
      this.updateGrafanaUrls();
      this.filtersForm.valueChanges.subscribe(() => this.updateGrafanaUrls());

      this.proveedoresArray = Object.entries(this.proveedores).map(([id, nombre]) => ({
        id: Number(id),
        nombre,
      }));

      this.productosArray = Object.entries(this.productos).map(([id, nombre]) => ({
        id: Number(id),
        nombre,
      }));

      this.tiposProductoArray = Object.entries(this.tiposProducto).map(([id, nombre]) => ({
        id: Number(id),
        nombre,
      }));
    });
  }

  private formatToUnix(date: Date | null): number {
    return date ? new Date(date).getTime() : 0;
  }

  private formatToString(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateGrafanaUrls(): void {
    const { start_date, end_date, proveedor, producto, tipo_producto } = this.filtersForm.value;

    const startDateUnix = this.formatToUnix(start_date) || 1728259200000;
    const endDateUnix = this.formatToUnix(end_date) || 1733356800000;

    const formattedStartDate = this.formatToString(start_date) || '2024-10-28';
    const formattedEndDate = this.formatToString(end_date) || '2024-12-03';

    const baseGrafanaUrl = 'https://grafanae-production.up.railway.app/d-solo/de2ghvhvnumf4d/compras';

    this.grafanaUrls.gastosPorProducto = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-proveedor=${proveedor}&var-producto=${producto}&var-tipo_producto=${tipo_producto}&orgId=1&panelId=4&theme=light`
    );

    this.grafanaUrls.gastosPorTipoProducto = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-proveedor=${proveedor}&var-producto=${producto}&var-tipo_producto=${tipo_producto}&orgId=1&panelId=2&theme=light`
    );

    this.grafanaUrls.comprasPorFechaHora = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-proveedor=${proveedor}&var-producto=${producto}&var-tipo_producto=${tipo_producto}&orgId=1&panelId=5&theme=light`
    );

    this.grafanaUrls.comprasPorProveedor = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-proveedor=${proveedor}&var-producto=${producto}&var-tipo_producto=${tipo_producto}&orgId=1&panelId=6&theme=light`
    );
  }

  limpiarFiltros(): void {
    this.filtersForm.reset(); // Resetea el formulario
    this.filtersForm.patchValue({
      start_date: null,
      end_date: null,
      proveedor: '',
      producto: '',
      tipo_producto: ''
    });
  }
}
