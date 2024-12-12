import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-visualizaciones-compras',
  templateUrl: './visualizaciones-compras.component.html',
  styleUrls: ['./visualizaciones-compras.component.scss'],
})
export class VisualizacionesComprasComponent implements OnInit {
  filtersForm: FormGroup;

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

  productos: { [id: number]: string } = {
    10: 'Remera Térmica',
    11: 'Sandalia Abigail',
    12: 'Sandalias Sole',
    19: 'Musculosa moda',
    21: 'Remera bordada',
    23: 'Zapatillas Sneaker',
    24: 'Pashmina Chalina',
    25: 'Converse Hi',
    26: 'Converse Low',
    27: 'Crocs Crocband',
    35: 'Gorro De Lana Tipo A',
    36: 'Gorro Lana Bean',
    37: 'Medias Altas',
    38: 'Zapato',
  };

  tiposProductoArray: { id: number; nombre: string }[] = [];

  tiposProducto: { [id: number]: string } = {
    20: 'Zapato',
    19: 'Medias',
    18: 'Gorro',
    15: 'Accesorio',
    12: 'Zapatillas',
    11: 'Musculosa',
    9: 'Sandalias',
    7: 'Remera Térmica',
    3: 'Remera',
    1: 'Jean',
  };

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
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
    this.updateGrafanaUrls(); // Inicializa las URLs
    this.filtersForm.valueChanges.subscribe(() => this.updateGrafanaUrls());

    // Convierte los objetos en arrays para mat-select
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