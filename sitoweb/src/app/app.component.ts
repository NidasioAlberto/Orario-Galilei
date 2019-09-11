import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { LocalStorageService } from './core/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogInformazioniComponent } from './dialog-informazioni/dialog-informazioni.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('barraRicerca', { static: false }) barraRicerca: ElementRef

  valoreRicerca: string

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.localStorage.impostaPaginaVisualizzata(false)

    // Controllo se l'utente è per la prima volta nell'app
    this.localStorage.controllaPaginaVisualizzata().then(paginaVisualizzata => {
      console.log(paginaVisualizzata)
      if (!paginaVisualizzata) {
        console.log('Prima volta sul sito')

        // Mostro il dialog di benvenuto
        this.dialog.open(DialogInformazioniComponent)

        // Imposto il sito come già visualizzato (così al prossimo avvio l'utente non  vedrà più l'avviso
        this.localStorage.impostaPaginaVisualizzata()
      } else {
        console.log('Sito già visualizzato')
      }
    })
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
