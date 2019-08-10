import { Component, OnInit, Input } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { Orario, ProssimoImpegno } from 'src/app/utils/orario';
import { FirestoreService } from 'src/app/core/firestore.service';
import { ElementoIndice } from 'src/app/utils/indice';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-elemento-ricerca',
  templateUrl: './elemento-ricerca.component.html',
  styleUrls: ['./elemento-ricerca.component.scss']
})
export class ElementoRicercaComponent implements OnInit {
  @Input() indiceOrario: ElementoIndice
  @Input() giorno: Observable<number>
  @Input() ora: Observable<number>

  orario: Observable<Orario>
  prossimiImpegni: Observable<string[]>

  tipo: string

  constructor(private firestore: FirestoreService, private router: Router) { }

  ngOnInit() {
    //Recupero il documento dell'orario
    this.orario = this.firestore.ottieniOrario(this.indiceOrario)

    //Imposto il tipo in base alla collection del documento
    if(this.indiceOrario.collection == 'Aule') this.tipo = 'Aula'
    if(this.indiceOrario.collection == 'Classi') this.tipo = 'Classe'
    if(this.indiceOrario.collection == 'Professori') this.tipo = 'Professore'

    this.prossimiImpegni = combineLatest(this.ora, this.giorno, this.orario).pipe(
      map(dati => this.firestore.trovaProssimiImpegni(dati[0], dati[1], dati[2], 2)),
      map(impegni => impegni.map(impegno =>
        impegno.giornoLable +
        ' ' +
        impegno.oraLable +
        ': ' +
        (impegno.info1 != undefined ? impegno.info1 : '') +
        (impegno.info1 != undefined && impegno.info2 != undefined ? ' ' : '') +
        (impegno.info2 != undefined ? impegno.info2 : '')
      ))
    )
  }

  /**
   * Per mostrare la previe delle informazioni (le card blu e arancioni)
   * dobbiamo calcolare in cosa è impegnato l'oggetto in questo momento
   * e in quello dopo. Se l'oggetto non è impegnato bisogna mostrare i
   * primi dati utili.
   * 
   * Ci servirà sapere l'orario e il giorno in cui siamo e l'orario e il
   * giorno da cui partire.
   */

  apriOrario() {
    console.log('Apri orario')
    this.router.navigate(['/orario'], {
      queryParams: {
        collection: this.indiceOrario.collection,
        document: this.indiceOrario.nome
      }
    })
  }
}
