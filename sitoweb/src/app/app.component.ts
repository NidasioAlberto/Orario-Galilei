import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from './core/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogInformazioniComponent } from './dialog-informazioni/dialog-informazioni.component';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(
    private localStorage: LocalStorageService,
    private dialog: MatDialog,
    private swUpdate: SwUpdate,
    private snakBar: MatSnackBar
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

    // Notifico l'utente quando una nuova versione dell'app è disponibile
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe((event) => {
        this.snakBar.open('Nuova versione disponibile', 'Aggiorna', { duration: 5000 }).onAction().subscribe(() => {
          // L'utente vuole aggiornare la pagina, la ricarico
          window.location.reload()
        })
      })
    }
  }
}
