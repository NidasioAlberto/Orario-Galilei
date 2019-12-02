import { Component, OnInit } from '@angular/core'
import { Observable, from } from 'rxjs'
import { Orario } from '../utils/orario.model'
import { StorageService } from '../core/storage.service'

@Component({
  selector: 'app-preferiti',
  templateUrl: './preferiti.component.html',
  styleUrls: ['./preferiti.component.scss']
})
export class PreferitiComponent implements OnInit {

  preferiti: Observable<Orario[]>

  constructor(private storage: StorageService) { }

  ngOnInit() {
    console.log('Preferiti!')
    
    this.preferiti = from(this.storage.ottieniPreferiti())

    this.preferiti.subscribe(preferiti => console.log('Preferiti', preferiti))
  }
}
