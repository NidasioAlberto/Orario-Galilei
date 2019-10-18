import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogInformazioniComponent } from '../dialog-informazioni/dialog-informazioni.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild('immagineLogo', { static: false }) logo: ElementRef;
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
  }

  ngAfterViewInit() {
    this.logo.nativeElement.oncontextmenu = (event: MouseEvent) => {
      this.mostraInfo()
      return false
    }
  }

  tornaAllaHome() {
    this.aggiornaValoreRicerca('')
  }

  mostraInfo() {
    this.dialog.open(DialogInformazioniComponent)
  }

  aggiornaValoreRicerca(valoreRicerca: string) {
    // Ogni volta che il valore di ricerca è valido mostro la pagina di ricerca
    if (valoreRicerca !== '') {
      // Se è valido mostro la pagina ricerca
      this.router.navigate(['/ricerca'], {
        queryParams: { valore: valoreRicerca }
      })
    } else {
      // Altrimenti la pagina principale
      this.router.navigate(['/'])
    }
  }
}
