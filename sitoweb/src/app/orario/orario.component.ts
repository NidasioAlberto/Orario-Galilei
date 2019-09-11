import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, take, tap, filter } from 'rxjs/operators';
import { Observable, combineLatest, concat } from 'rxjs';
import { Orario, ProssimoImpegno } from '../utils/orario.model';
import { FirestoreService } from '../core/firestore.service';
import { TempoService } from '../core/tempo.service';
import { LocalStorage } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-orario',
  templateUrl: './orario.component.html',
  styleUrls: ['./orario.component.scss']
})
export class OrarioComponent implements OnInit {

  orario: Observable<Orario>
  impegni: Observable<ProssimoImpegno[]>
  impegniLable: Observable<string[]>
  inPreferiti = false

  constructor(
    private router: ActivatedRoute,
    private firestore: FirestoreService,
    private tempo: TempoService,
    private localStorage: LocalStorage
  ) { }

  ngOnInit() {
    // Recupero l'orario prima dal database offline e poi da firestore
    this.orario = this.router.queryParams.pipe(
      mergeMap((params, index) => {
        return concat(
          this.localStorage.getItem('preferiti').pipe(
            map((preferiti: Orario[]) => {
              if (preferiti) {
                const preferito = preferiti.find(elemento => elemento.nome === params.document)
                if (preferito) {
                  this.inPreferiti = true
                }
                return preferito
              } else {
                return undefined
              }
            }),
          ),
          this.firestore.ottieniOrario({collection: params.collection, nome: params.document})
        )
      }),
      filter(orario => orario !== undefined)
    )

    this.impegni = combineLatest(this.orario, this.tempo.ora, this.tempo.giorno).pipe(
      map(dati => this.firestore.trovaProssimiImpegni(dati[1], dati[2], dati[0], 2)),
    )

    this.impegniLable = this.impegni.pipe(
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

  async aggiungiAiPreferiti() {
    const orarioPreferito = await this.orario.pipe(take(1)).toPromise()

    const preferitiInMemoria = (await this.localStorage.getItem('preferiti').toPromise()) as Orario[]

    let preferiti: Orario[] = []

    // Recupero se possibile il vecchio orario
    if (preferitiInMemoria) {
      preferiti = preferitiInMemoria
    }

    // Controlo se è già presente
    if (!preferiti.find(preferito => preferito.nome === orarioPreferito.nome)) {
      // Aggiungo il nuovo orario alla lista
      preferiti.push(orarioPreferito)

      // Salvo i preferiti
      await this.localStorage.setItem('preferiti', preferiti).toPromise()

      this.inPreferiti = true
    }
  }

  async rimuoviDaiPreferiti() {
    // Recupero l'orario da rimuovere
    const orarioDaRimuovere = await this.orario.pipe(take(1)).toPromise()

    // Recupero i preferiti
    let preferiti = (await this.localStorage.getItem('preferiti').toPromise()) as Orario[]

    // Rimuovo l'orario corrente
    preferiti = preferiti.filter(preferito => preferito.nome !== orarioDaRimuovere.nome)

    // Salvo i preferiti
    await this.localStorage.setItem('preferiti', preferiti).toPromise()

    this.inPreferiti = false
  }
}
