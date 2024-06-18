import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'front';
  sideBarOpen = true;

  sideBarToggler(event: any) {
    if (event) {
      this.sideBarOpen = !this.sideBarOpen;
    } else {
      this.sideBarOpen = event;
    }
  }

  ngOnInit(){
    console.log('jsdfndsafds');
  }

}
