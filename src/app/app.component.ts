import {Component, HostListener, OnInit} from '@angular/core';
import {ThemeCalidoService} from "./services/theme.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'front';
  sideBarOpen = false;
  screenWidth: number = 0;
  darkMode: boolean = false;

  constructor(private themeService: ThemeCalidoService) {}

  ngOnInit() {
    this.obtenerInformacionTema();
    this.calcularSizeScreen();
    this.updateSideBarState();
  }

  obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  calcularSizeScreen() {
    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  updateSideBarState() {
    this.sideBarOpen = this.screenWidth <= 700;
  }

  sideBarToggler(event: any) {
    if (event) {
      this.sideBarOpen = !this.sideBarOpen;
    } else {
      this.sideBarOpen = event;
    }
  }

  toggleTheme(event: any) {
    this.darkMode = event;
  }
}
