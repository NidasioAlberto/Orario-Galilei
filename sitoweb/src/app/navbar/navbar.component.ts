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
  @Output() aggiornaValoreRicerca = new EventEmitter<string>();
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
    this.router.navigate(['/'])
  }

  mostraInfo() {
    this.dialog.open(DialogInformazioniComponent)
  }
}
