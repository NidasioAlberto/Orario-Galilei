import { Component, OnInit } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { MatSnackBar } from '@angular/material/snack-bar'
import { StorageService } from './core/storage.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private swUpdate: SwUpdate,
    private snakBar: MatSnackBar,
    private storage: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
    // Notifico l'utente quando una nuova versione dell'app è disponibile
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.snakBar.open('Nuova versione disponibile', 'Aggiorna', { duration: 5000 }).onAction().subscribe(() => {
          // L'utente vuole aggiornare la pagina, la ricarico
          window.location.reload()
        })
      })
    }

    // Se è il primo avvio dell'app mostro le informazioni
    this.storage.controllaPrimoAvvio().then(esecuzioni => {
      if(esecuzioni === 0) this.router.navigate(['/informazioni'])
    })
  }
}
