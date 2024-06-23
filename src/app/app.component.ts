import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "./services/auth.servicie";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'front';
  sideBarOpen = false;
  estaLogeado: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(){
    this.authService.getAuthenticationStatus().subscribe((estaLogeado) => {
      if (estaLogeado) {
        this.estaLogeado = true;
        this.sideBarOpen = true;
      } else {
        this.estaLogeado = false;
        this.router.navigate(['/login']);
      }
    })
  }

  sideBarToggler(event: any) {
    if (event) {
      this.sideBarOpen = !this.sideBarOpen;
    } else {
      this.sideBarOpen = event;
    }
  }
}
