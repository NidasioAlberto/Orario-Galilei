import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Orario } from 'src/app/utils/orario';
import { FirestoreService } from 'src/app/core/firestore.service';
import { ElementoIndice } from 'src/app/utils/indice';

@Component({
  selector: 'app-elemento-ricerca',
  templateUrl: './elemento-ricerca.component.html',
  styleUrls: ['./elemento-ricerca.component.scss']
})
export class ElementoRicercaComponent implements OnInit, OnChanges {
  @Input() indiceOrario: ElementoIndice
  @Input() giorno: Observable<number>
  @Input() ora: Observable<number>

  orario: Observable<Orario>

  tipo: string

  constructor(private firestore: FirestoreService) { }

  ngOnInit() { }

  ngOnChanges() {
    if(this.indiceOrario.collection == 'Aule') this.tipo = 'Aula'
    if(this.indiceOrario.collection == 'Classi') this.tipo = 'Classe'
    if(this.indiceOrario.collection == 'Professori') this.tipo = 'Professore'
    
    console.log('creazione di ' + this.indiceOrario.nome)

    //Recupero il documento dell'orario
    this.orario = this.firestore.ottieniOrario(this.indiceOrario)
    this.orario.subscribe(orario => console.log(this.indiceOrario, orario))
    
    this.giorno.subscribe(giorno => console.log('Giorno: ' + giorno))
    this.ora.subscribe(ora => console.log('Ora: ' + ora))
  }
}
