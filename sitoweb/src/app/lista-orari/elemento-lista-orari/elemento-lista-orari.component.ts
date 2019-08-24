import { Component, OnInit, Input } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { Orario, ProssimoImpegno } from 'src/app/utils/orario.model';
import { FirestoreService } from 'src/app/core/firestore.service';
import { ElementoIndice } from 'src/app/utils/indice.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TempoService } from 'src/app/core/tempo.service';

@Component({
  selector: 'app-elemento-lista-orari',
  templateUrl: './elemento-lista-orari.component.html',
  styleUrls: ['./elemento-lista-orari.component.scss']
})
export class ElementoListaOrariComponent implements OnInit {
  @Input() indiceOrario: ElementoIndice
  @Input() orarioOffline: Orario

  orario: Observable<Orario>
  prossimiImpegni: Observable<string[]>

  tipo: string

  constructor(
    private firestore: FirestoreService,
    private router: Router,
    private tempo: TempoService,
  ) { }

  ngOnInit() {
    // Controllo i dati ricevuti
    if (this.indiceOrario !== undefined) {
      // Recupero il documento dell'orario
      this.orario = this.firestore.ottieniOrario(this.indiceOrario)

      // Imposto il tipo in base alla collection del documento
      if (this.indiceOrario.collection === 'Aule') {
        this.tipo = 'Aula'
      } else if (this.indiceOrario.collection === 'Classi') {
        this.tipo = 'Classe'
      } else if (this.indiceOrario.collection === 'Professori') {
        this.tipo = 'Professore'
      }
    } else {
      this.orario = of(this.orarioOffline)

      // Imposto il tipo in base alla collection del documento
      this.tipo = this.orarioOffline.tipo

      // Imposto l'indice
      this.indiceOrario = {
        nome: this.orarioOffline.nome,
        collection: this.orarioOffline.collection
      }
    }

    this.prossimiImpegni = combineLatest(this.tempo.ora, this.tempo.giorno, this.orario).pipe(
      map(dati => this.firestore.trovaProssimiImpegni(dati[0], dati[1], dati[2], 2)),
      map(impegni => impegni.map(impegno =>
        impegno.giornoLable +
        ' ' +
        impegno.oraLable +
        ': ' +
        (impegno.info1 !== undefined ? impegno.info1 : '') +
        (impegno.info1 !== undefined && impegno.info2 !== undefined ? ' ' : '') +
        (impegno.info2 !== undefined ? impegno.info2 : '')
      ))
    )
  }

  apriOrario() {
    this.router.navigate(['/orario'], {
      queryParams: {
        collection: this.indiceOrario.collection,
        document: this.indiceOrario.nome,
      }
    })
  }
}
