import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() aggiornaValoreRicerca = new EventEmitter<string>();
  valoreRicerca: string

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(take(2)).subscribe(queryParams => {
      console.log(queryParams)
      this.valoreRicerca = queryParams.valore
    })

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (!event.url.includes('ricerca')) {
        this.valoreRicerca = ''
      }
    })
  }

  tornaAllaHome() {
    this.router.navigate(['/'])
  }
}
