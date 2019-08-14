import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('barraRicerca', { static: false }) barraRicerca: ElementRef

  valoreRicerca: Observable<string>

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd) {
        if(event.url.indexOf('ricerca') < 0) this.barraRicerca.nativeElement.value = ''
        else {
          let urlData = this.router.parseUrl(event.url)
          this.barraRicerca.nativeElement.value = urlData.queryParams.valore
        }
      }
    })
  }

  ngAfterViewInit() {
    //Creo un observable per il valore di ricerca
    this.valoreRicerca = fromEvent(this.barraRicerca.nativeElement, 'keyup').pipe(
      map(keyEvent => keyEvent[`target`].value)
    )

    //Ogni volta che il valore di ricerca è valido mostro la pagina di ricerca
    this.valoreRicerca.subscribe(valore => {
      if(valore != '') {
        //Se è valido mostro la pagina ricerca
        this.router.navigate(['/ricerca'], {
          queryParams: { valore }
        })
      } else {
        //Altrimenti i preferiti, ovvero la pagina principale
        //TODO: mostrare i preferiti!
        this.router.navigate(['/'])
      }
    })
  }
}