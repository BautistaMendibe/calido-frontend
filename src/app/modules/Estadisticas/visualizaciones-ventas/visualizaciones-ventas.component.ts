import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-visualizaciones-ventas',
  templateUrl: './visualizaciones-ventas.component.html',
  styleUrls: ['./visualizaciones-ventas.component.scss'],
})
export class VisualizacionesVentasComponent implements OnInit {
  filtersForm: FormGroup;

  paymentMethods: string[] = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'Cuenta Corriente',
    'Saldo de cuenta corriente',
    'Mercado Pago',
    'QR',
  ];
  categories: string[] = [
    'Zapatillas',
    'Accesorios',
    'Mochila',
    'Zapato',
    'Medias',
    'Gorro',
    'Sandalias',
    'Musculosa',
    'Remera',
  ];
  
  employees: string[] = [
    'Julian Carles',
    'Joaquin Antonio Battig Chavez',
    'Bautista Mendibe',
    'Bautista Juan Lopez Mendibe',
    'Nicolas Coronati',
    'Federico Coronati',
    'Juan Mendibe',
    'Silvia Nuñez',
    'Federico Coronati',
  ];
  grafanaUrls: {
    formaPago: SafeResourceUrl;
    fechaHora: SafeResourceUrl;
    categoria: SafeResourceUrl;
    empleados: SafeResourceUrl;
  } = {
    formaPago: '',
    fechaHora: '',
    categoria: '',
    empleados: '',
  };

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.filtersForm = this.fb.group({
      start_date: [null],
      end_date: [null],
      payment_method: [''],
      var_category: [''],
      employee_name: [''],
    });
  }

  ngOnInit(): void {
    this.updateGrafanaUrls();
    this.filtersForm.valueChanges.subscribe(() => this.updateGrafanaUrls());
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
    const { start_date, end_date, payment_method, var_category, employee_name } = this.filtersForm.value;

    const startDateUnix = this.formatToUnix(start_date) || 1728259200000;
    const endDateUnix = this.formatToUnix(end_date) || 1733356800000;

    const formattedStartDate = this.formatToString(start_date) || '2024-12-01';
    const formattedEndDate = this.formatToString(end_date) || '3000-01-01';

    const baseGrafanaUrl = 'https://grafanae-production.up.railway.app/d-solo/fe2gk0zzvuo00f/ventas';

    let employeeFilter = '';
    if (employee_name === 'Todos') {
      employeeFilter = this.employees.map((name) => encodeURIComponent(name)).join(',');
    } else if (employee_name) {
      employeeFilter = encodeURIComponent(employee_name);
    }

    this.grafanaUrls.formaPago = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-payment_method=${payment_method}&var-var_category=${var_category}&var-Empleado=${employeeFilter}&orgId=1&panelId=7&theme=light`
    );

    this.grafanaUrls.fechaHora = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-Empleado=${employeeFilter}&orgId=1&panelId=8&theme=light`
    );

    this.grafanaUrls.categoria = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-payment_method=${payment_method}&var-var_category=${var_category}&var-Empleado=${employeeFilter}&orgId=1&panelId=2&theme=light`
    );

    this.grafanaUrls.empleados = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${baseGrafanaUrl}?from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-Empleado=${employeeFilter}&orgId=1&panelId=9&theme=light`
    );
  }

  limpiarFiltros() {
    this.filtersForm.reset(); // Resetea el formulario
    this.filtersForm.patchValue({
      start_date: null, // O un valor predeterminado
      end_date: null, // O un valor predeterminado
      payment_method: '', // "Todos" o vacío
      var_category: '', // "Todas" o vacío
      employee_name: '', // "Todos" o vacío
    });
  }
}
