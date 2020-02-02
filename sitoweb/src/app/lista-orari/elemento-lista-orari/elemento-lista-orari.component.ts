import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { Orario } from 'src/app/utils/orario.model'
import { Observable, combineLatest, BehaviorSubject } from 'rxjs'
import { StorageService } from 'src/app/core/storage.service'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router'
import { AngularFireAnalytics } from '@angular/fire/analytics'

@Component({
  selector: 'app-elemento-lista-orari',
  templateUrl: './elemento-lista-orari.component.html',
  styleUrls: ['./elemento-lista-orari.component.scss']
})
export class ElementoListaOrariComponent implements OnInit, OnChanges {

  @Input('orario') datiOrario: Orario
  orario = new BehaviorSubject<Orario>(this.datiOrario);
  prossimiImpegni: Observable<string[]>

  constructor(
    private storage: StorageService,
    private router: Router,
    private analytics: AngularFireAnalytics
  ) { }

  ngOnInit() {
    this.prossimiImpegni = combineLatest([this.storage.tempo, this.orario]).pipe(
      map(([tempo, orario]) => {
        return this.storage.trovaProssimiImpegni(tempo.ora, tempo.giorno, orario, 2)
      }),
      map(impegni => impegni.map(impegno =>
        impegno.giornoLable + ' ' +
        impegno.oraLable + ': ' +
        (impegno.elementi[0] !== undefined ? impegno.elementi[0] : '') +
        (impegno.elementi[0] !== undefined && impegno.elementi[1] !== undefined ? ' ' : '') +
        (impegno.elementi[1] !== undefined ? impegno.elementi[1] : '')
      ))
    )
  }

  ngOnChanges() {
    this.orario.next(this.datiOrario)
  }

  apriOrario() {
    console.log('Mostro la pagina dell\'orario di', this.datiOrario.nome)
    this.analytics.logEvent('apertura_orario', {
      nome: this.datiOrario.nome,
      collection: this.datiOrario.collection,
    })
    
    this.router.navigate(['/orario'], {
      queryParams: {
        collection: this.datiOrario.collection,
        nome: this.datiOrario.nome,
      },
    })
  }
}
