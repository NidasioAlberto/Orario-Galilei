import { Component, OnInit, Input } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { Orario, ProssimoImpegno } from 'src/app/utils/orario';
import { FirestoreService } from 'src/app/core/firestore.service';
import { ElementoIndice } from 'src/app/utils/indice';
import { map } from 'rxjs/operators';

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

  constructor(private firestore: FirestoreService) { }

  ngOnInit() {
    //Recupero il documento dell'orario
    this.orario = this.firestore.ottieniOrario(this.indiceOrario)

    //Imposto il tipo in base alla collection del documento
    if(this.indiceOrario.collection == 'Aule') this.tipo = 'Aula'
    if(this.indiceOrario.collection == 'Classi') this.tipo = 'Classe'
    if(this.indiceOrario.collection == 'Professori') this.tipo = 'Professore'

    this.prossimiImpegni = combineLatest(this.ora, this.giorno, this.orario).pipe(
      map(dati => this.trovaProssimiImpegni(dati[0], dati[1], dati[2], 2)),
      map(impegni => impegni.map(impegno =>
        impegno.giornoLable +
        ' ' +
        impegno.oraLable +
        ': ' +
        (impegno.info1 != undefined ? impegno.info1 : '') +
        (impegno.info1 != undefined && impegno.info2 != undefined ? '-' : '') +
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

   /**
    * Trovo n impegni all'interno dell'orario specificato a partire dall'ora e dal giorno indicati
    * @param ora ora da cui partire
    * @param giorno giorno da cui partire
    * @param orario orario da controllare
    * @param numeroImpegni numero di impegni da estrarre, è possibile impostarlo ad Infinity, verranno recuperati tutti gli impegni dal momento indicato!
    */
   trovaProssimiImpegni(ora: number, giorno: number, orario: Orario, numeroImpegni: number) {
     let oraPartenza = ora
     let giornoPartenza = giorno
     let oraFine = ora
     let giornoFine = giorno

     let impegni: ProssimoImpegno[] = []

      for(let i = 0; i < numeroImpegni; i++) {
        let impegno = this.trovaProssimoImpegno(oraPartenza, giornoPartenza, oraFine, giornoFine, orario)

          if(impegno != undefined) {
            oraPartenza = impegno.ora + 1
            giornoPartenza = impegno.giorno

            if(impegni.length == 0) {
              oraFine = impegno.ora
              giornoFine = impegno.giorno
            }

            impegni.push(impegno)
          } else {
            break
          }
      }

      return impegni
   }

   /**
    * 
    * @param oraPartenza Ora dalla quale cercare
    * @param giornoPartenza Giorno dal quale cercare
    * @param oraFine Ora fino alla quale cercare
    * @param giornoFine Giorno fino al quale cercare
    * @param orario 
    */
   trovaProssimoImpegno(oraPartenza: number, giornoPartenza: number, oraFine: number, giornoFine: number, orario: Orario): ProssimoImpegno {
     //Nei commenti di questa funzione per ora e giorno corrente si intendono quelli del ciclo for

     if(orario == undefined || orario.tabelleOrario.tabellaPerGiorni == undefined) return undefined
     else {
       let giornoControllo = giornoPartenza
       let oraPartenzaControllo = (oraPartenza < 0 ? 0 : oraPartenza)

       for(let i = 0; i < 6; i++) {
         //Cerco i dati del giorno corrente
         let datiGiornoCorrente = orario.tabelleOrario.tabellaPerGiorni.find(orarioGiorno => orarioGiorno.giorno == giornoControllo)
         
         if(datiGiornoCorrente != undefined) {
           for(let k = oraPartenzaControllo; k < 8; k++) {
             //Controllo se siamo arrivata alla fine
             if(k == oraFine && giornoControllo == giornoFine) {
               console.log('Raggiunta la fine')
               return undefined
             }

             //Cerco i dati dell'ora corrente
             let datiOraCorrenteInfo1 = datiGiornoCorrente.info1.find(orarioOra => orarioOra.ora == k)
             let datiOraCorrenteInfo2 = datiGiornoCorrente.info2.find(orarioOra => orarioOra.ora == k)
             
             if(datiOraCorrenteInfo1 != undefined || datiOraCorrenteInfo2 != undefined) {
               //In questo caso abbiamo trovato il prossimo impegno!
               return {
                 ora: k,
                 oraLable: this.ottieniLableOra(k),
                 giorno: giornoControllo,
                 giornoLable: this.ottieniLableGiorno(giornoControllo),
                 info1: (datiOraCorrenteInfo1 != undefined ? datiOraCorrenteInfo1.nome : undefined),
                 info2: (datiOraCorrenteInfo2 != undefined ? datiOraCorrenteInfo2.nome : undefined)
                }
              }
              //Altrimenti se i dati dell'ora corrente sono undefined vuol dire che non c'è alcuna attvitià in quest'ora, passo alla prosssima
            }
          }
          //Se i dati del giorno corrente sono undefined vuol dire che nel giorno corrente non sono previste attvitià, controllo il prossimo giorno
          
          //Resetto il giorno se passiamo alla settimana successiva
          giornoControllo ++
          if(giornoControllo >= 6) giornoControllo = 0

          //Imposto il prossimo orario di partenza come 1 ora
          oraPartenzaControllo = 0
       }
       orario.tabelleOrario.tabellaPerGiorni[0].info1
     }
   }

   ottieniLableOra(ora: number) {
     switch(ora) {
       case 0: return '1a'
       case 1: return '2a'
       case 2: return '3a'
       case 3: return '4a'
       case 4: return '5a'
       case 5: return '6a'
       case 6: return '1p'
       case 7: return '2p'
       default: return 'hey'
     }
   }

   ottieniLableGiorno(giorno: number) {
     switch(giorno) {
       case 0: return 'Lun'
       case 1: return 'Mar'
       case 2: return 'Mer'
       case 3: return 'Gio'
       case 4: return 'Ven'
       case 5: return 'Sab'
       default: return 'Wow'
     }
   }

   apriOrario() {
     console.log('Apri orario')
   }
}
