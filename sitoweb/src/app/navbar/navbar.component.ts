import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  @Output() aggiornaValoreRicerca = new EventEmitter<string>();

  constructor(
    private router: Router
  ) { }

  tornaAllaHome() {
    this.router.navigate(['/'])
  }
}
