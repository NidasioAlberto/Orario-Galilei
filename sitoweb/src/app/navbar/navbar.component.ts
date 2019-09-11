import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogInformazioniComponent } from '../dialog-informazioni/dialog-informazioni.component';

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
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(take(2)).subscribe(queryParams => {
      this.valoreRicerca = queryParams.valore
    })

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (!event.url.includes('ricerca')) {
        this.valoreRicerca = ''
      }
    })

    // Pressioni lunge su mobile
    window.oncontextmenu = (event: MouseEvent) => {
      this.mostraInfo()
      return false
    }
  }

  tornaAllaHome() {
    this.router.navigate(['/'])
  }

  mostraInfo() {
    this.dialog.open(DialogInformazioniComponent)
  }
}
