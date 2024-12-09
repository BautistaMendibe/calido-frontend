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

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    // Inicializa el formulario
    this.filtersForm = this.fb.group({
      start_date: [null],
      end_date: [null],
    });
  }

  ngOnInit(): void {
    this.updateGrafanaUrls(); // Inicializa las URLs
    this.filtersForm.valueChanges.subscribe(() => this.updateGrafanaUrls()); // Actualiza las URLs cuando cambien los filtros
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
    const { start_date, end_date } = this.filtersForm.value;

    const startDateUnix = this.formatToUnix(start_date) || 1728259200000; // Valor predeterminado si no hay fecha
    const endDateUnix = this.formatToUnix(end_date) || 1733356800000; // Valor predeterminado si no hay fecha

    const formattedStartDate = this.formatToString(start_date) || '2024-10-28'; // Fecha predeterminada
    const formattedEndDate = this.formatToString(end_date) || '2024-12-03'; // Fecha predeterminada

    const baseGrafanaUrl = 'https://grafanae-production.up.railway.app/d-solo/de2ghvhvnumf4d/compras';

    this.grafanaUrls.gastosPorProducto = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&orgId=1&panelId=4&theme=light`
    );

    this.grafanaUrls.gastosPorTipoProducto = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&orgId=1&panelId=2&theme=light`
    );

    this.grafanaUrls.comprasPorFechaHora = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&orgId=1&panelId=5&theme=light`
    );

    this.grafanaUrls.comprasPorProveedor = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&orgId=1&panelId=6&theme=light`
    );
  }

  limpiarFiltros(): void {
    this.filtersForm.reset(); // Resetea el formulario
    this.filtersForm.patchValue({
      start_date: null,
      end_date: null,
    });
  }
}

