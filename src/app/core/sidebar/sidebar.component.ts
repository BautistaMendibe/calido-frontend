import {Component, EventEmitter, Output} from '@angular/core';
import {Menu} from "../../models/menu.model";
import {
  animateSubText,
  animateText,
  animateTextTraslate,
  onSideNavChange
} from '../../shared/animations';
import {Router} from "@angular/router";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [onSideNavChange, animateText, animateTextTraslate, animateSubText]
})
export class SidebarComponent {

  @Output() toggleSideBarForMe: EventEmitter<boolean> = new EventEmitter();
  menuItems: Menu[] = [
    {id: 1, nombre: 'Inicio', path:'', icon: 'home', activo: false, subMenu: []},
    {id: 2, nombre: 'Ventas', path:'', icon: 'sell', activo: false, subMenu: []},
    {id: 3, nombre: 'Promociones', path:'consultar-promociones', icon: 'card_giftcard', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar promociones', path:'/consultar-promociones', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Notificar promocion', path:'/notificar-promocion', icon: '', activo: false, subMenu: []}
      ]},
    {id: 4, nombre: 'Productos', path:'/consultar-productos', icon: 'shopping_cart', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar productos', path:'/consultar-productos', icon: '', activo: false, subMenu: []}
      ]},
    {id: 5, nombre: 'Proveedores', path:'consultar-proveedores', icon: 'local_shipping', activo: false, subMenu: []},
    {id: 6, nombre: 'Estadisticas', path:'/', icon: 'data_usage', activo: false, subMenu: []},
    {id: 7, nombre: 'Empleados', path:'/consultar-empleados', icon: 'supervisor_account', activo: false, subMenu: [
      {id: 1, nombre: 'Consultar empleados', path:'/consultar-empleados', icon: '', activo: false, subMenu: []}
    ]},
    {id: 8, nombre: 'Configuración', path:'consultar-configuraciones', icon: 'settings', activo: false, subMenu: []}
  ];
  isExpanded = true;
  isShowing = false;
  showFiller = false;
  public sideNavState = false;
  public linkText = false;

  constructor(private router: Router) {
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
    this.router.navigate([ `${item.path}` ]);
  }

  activarItem(item: Menu) {
    this.menuItems.map((x) => {
      if (x.activo && item.id !== x.id) {
        x.activo = false;
      }
    });
    item.activo = !item.activo;
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
      item.activo = false;
      if (item.subMenu) {
        item.subMenu.forEach(subItem => {
          subItem.activo = false;
        });
      }
    })
  }

}
