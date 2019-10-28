import { Component, OnInit, HostBinding, Renderer2 } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  temaCorrente: string = 'light-theme'

  constructor(
    private swUpdate: SwUpdate,
    private snakBar: MatSnackBar,
    private rendered: Renderer2
  ) { }

  ngOnInit() {
    // Notifico l'utente quando una nuova versione dell'app è disponibile
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.snakBar.open('Nuova versione disponibile', 'Aggiorna', { duration: 5000 }).onAction().subscribe(() => {
          // L'utente vuole aggiornare la pagina, la ricarico
          window.location.reload()
        })
      })
    }
  }

  cambiaTema() {
    this.rendered.removeClass(document.body, this.temaCorrente);
    if(this.temaCorrente === 'light-theme') {
      this.temaCorrente = 'dark-theme'
    } else {
      this.temaCorrente = 'light-theme'
    }
    this.rendered.addClass(document.body, this.temaCorrente);
  }
}
