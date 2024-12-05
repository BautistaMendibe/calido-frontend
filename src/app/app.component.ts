import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'front';
  sideBarOpen = false;
  screenWidth: number = 0;

  constructor() {}

  ngOnInit() {
    this.calcularSizeScreen();
    this.updateSideBarState();
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
}
