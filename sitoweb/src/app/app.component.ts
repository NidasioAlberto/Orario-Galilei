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
  valoreRicerca: string

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // Controllo se l'utente è per la prima volta nell'app
    this.localStorage.controllaPaginaVisualizzata().then(paginaVisualizzata => {
      if (!paginaVisualizzata) {
        // Mostro il dialog di benvenuto
        this.dialog.open(DialogInformazioniComponent)

        // Imposto il sito come già visualizzato (così al prossimo avvio l'utente non  vedrà più l'avviso
        this.localStorage.impostaPaginaVisualizzata()
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
