import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Menu} from "../../models/menu.model";
import {
  animateSubText,
  animateText,
  animateTextTraslate,
  onSideNavChange
} from '../../shared/animations';
import {NavigationEnd, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {filter} from "rxjs";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [onSideNavChange, animateText, animateTextTraslate, animateSubText]
})
export class SidebarComponent implements OnInit {

  @Output() toggleSideBarForMe: EventEmitter<boolean> = new EventEmitter();
  menuItems: Menu[] = [
    {id: 1, nombre: 'Inicio', path:'', icon: 'home', activo: false, subMenu: []},
    {id: 2, nombre: 'Ventas', path:'registrar-venta', icon: 'sell', activo: false, subMenu: [
        {id: 1, nombre: 'Registrar venta', path:'/registar-venta', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Consultar ventas', path:'/consultar-ventas', icon: '', activo: false, subMenu: []}
      ]},
    {id: 3, nombre: 'Ordenes de Compra', path:'consultar-pedidos', icon: 'receipt', activo: false, requiresAdmin: true, subMenu: []},
    {id: 4, nombre: 'Inventario', path:'consultar-comprobante', icon: 'add_box', activo: false, requiresAdmin: true, subMenu: [
        {id: 1, nombre: 'Consultar comprobantes', path:'/consultar-comprobante', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Consultar inventario', path:'/consultar-inventario', icon: '', activo: false, subMenu: []}
      ]},
    {id: 5, nombre: 'Promociones', path:'consultar-promociones', icon: 'card_giftcard', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar promociones', path:'/consultar-promociones', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Notificar promocion', path:'/notificar-promocion', icon: '', activo: false, subMenu: []}
      ]},
    {id: 6, nombre: 'Productos', path:'consultar-productos', icon: 'shopping_cart', activo: false, subMenu: []},
    {id: 7, nombre: 'Proveedores', path:'consultar-proveedores', icon: 'local_shipping', activo: false, subMenu: []},
    {id: 8, nombre: 'Estadisticas', path:'/consultar-estadisticas', icon: 'data_usage', activo: false, subMenu: []},
    {id: 9, nombre: 'Empleados', path:'/consultar-empleados', icon: 'supervisor_account', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar empleados', path:'/consultar-empleados', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Consultar asistencia', path:'/consultar-asistencia', icon: '', activo: false, requiresAdmin: true, subMenu: []}
      ]},
    {id: 10, nombre: 'Clientes', path:'/consultar-clientes', icon: 'person_add', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar clientes', path:'/consultar-clientes', icon: '', activo: false, subMenu: []},
      ]},
    {id: 11, nombre: 'Cuentas Corrientes', path:'consultar-cuentas-corrientes', icon: 'account_balance', activo: false, subMenu: []},
    {id: 12, nombre: 'Asistencia', path:'/marcar-asistencia', icon: 'event_available', activo: false, subMenu: []},
    {id: 13, nombre: 'Configuración', path:'consultar-configuraciones', icon: 'settings', activo: false, requiresAdmin: true, subMenu: []}
  ];
  isExpanded = true;
  isShowing = false;
  showFiller = false;
  public sideNavState = false;
  public linkText = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.setActiveItemBasedOnUrl();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setActiveItemBasedOnUrl();
    });
  }

  setActiveItemBasedOnUrl(): void {
    const currentUrl = this.router.url;

    this.menuItems.forEach(item => {
      item.activo = (item.path && currentUrl.includes(item.path)) || (currentUrl === "/" && item.nombre === 'Inicio');

      // Activa submenús si la URL coincide con su path
      if (item.subMenu) {
        item.subMenu.forEach(subItem => {
          if (subItem.path && currentUrl.includes(subItem.path)) {
            subItem.activo = true;
            item.activo = true;
          }
        });
      }
    });
  }

  onSinenavToggle() {
    this.sideNavState = !this.sideNavState;

    if (!this.sideNavState) {
      this.colapsarSubmenus();
    }

    setTimeout(() => {
      this.linkText = this.sideNavState;
    }, 300);
  }

  navigate(item: Menu) {
    this.router.navigate([item.path]);
  }

  activarItem(item: Menu) {
    if (item.activo) {
      return;
    }

    this.menuItems.forEach(x => {
      if (x.activo && item.id !== x.id) {
        x.activo = false;
      }
    });
    item.activo = true;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles pasados por parámetro.
   * Compara si el rol del usuario está incluido en la lista.
   * @param nombresRol lista con roles. Ejemplo: ['Administrador', 'Vendedor']
   */
  tieneRol(nombresRol: string[]): boolean {
    const token = this.authService.getToken();
    const infoToken: any = this.authService.getDecodedAccessToken(token);

    if (!infoToken || !infoToken.roles) {
      return false;
    }

    return nombresRol.some(nombreRol => infoToken.roles.includes(nombreRol));
  }

  capitalize(word?: string): string {
    // @ts-ignore
    return word?.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  activarSubItem(subItem: Menu) {
    this.menuItems.map((x) => {
      if (x.subMenu) {
        x.subMenu.map(s => {
            if (s.activo && subItem.id !== s.id) {
                s.activo = false;
            }
        });
      }
    });
    subItem.activo = !subItem.activo;
  }

  colapsarSubmenus() {
    this.menuItems.forEach(item => {
      if (!item.activo) {
        item.activo = false;
      }

      // Cerrar todos los submenús
      if (item.subMenu) {
        item.subMenu.forEach(subItem => {
          subItem.activo = false; // Cerrar todos los subítems
        });
      }
    });
  }

}
