import { Injectable } from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage'
import { HttpClient } from '@angular/common/http'
import { Orario, ProssimoImpegno, Info } from '../utils/orario.model'
import { StorageMap } from '@ngx-pwa/local-storage'
import { interval, BehaviorSubject, } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

// TODO: Aggiungere la lettura da firebase?

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  tempo = new BehaviorSubject({
    giorno: new Date().getDay() - 1,
    ora: new Date().getHours() - 8
  })

  constructor(
    private storage: AngularFireStorage,
    private http: HttpClient,
    private storageMap: StorageMap
  ) {
    // Controllo ogni 30 secondi se l'ora o il giorno sono cambiati
    interval(30 * 1000).pipe(
      startWith(0),
      map(() => {
        return {
          giorno: new Date().getDay() - 1,
          ora: new Date().getHours() - 8
        }
      })
    ).subscribe(tempo => {
      console.log('Controllo il tempo, ora: ' + tempo.ora + ' giorno: ' + tempo.giorno)
      const tempoSalvato = this.tempo.value
      if (tempo.giorno !== tempoSalvato.giorno || tempo.ora !== tempoSalvato.ora) this.tempo.next(tempo)
    })
  }

  public async caricaOrariCompleti() {
    // Recupero tutti gli orari dal backup
    console.log('Recupero il file json con gli orari')
    return this.storage.ref('backup-orari/test.json').getDownloadURL().toPromise().then(backupUrl => {
      return this.http.get(backupUrl, {
        responseType: 'json'
      }).toPromise().then(async (orari: {
        orariClassi: Orario[],
        orariAule: Orario[],
        orariProfessori: Orario[]
      }) => {
        // Salvo tutti gli orari in IndexedDB mantenendo però le preferenze

        // Recupero eventuali orari già salvati localmente
        const classi = await this.storageMap.get('Classi').toPromise() as Orario[]
        const aule = await this.storageMap.get('Aule').toPromise() as Orario[]
        const professori = await this.storageMap.get('Professori').toPromise() as Orario[]

        // Controllo se l'utente sta transitando dalla versione 0 alle versione 1
        const vecchiPreferiti = await this.storageMap.get('preferiti').toPromise() as Orario[]

        // Per ogni nuovo orario controllo se era salvato come preferito
        orari.orariClassi = orari.orariClassi.map(orario => {
          if (classi !== undefined) {
            const vecchioOrario = classi.find(classe => classe.nome === orario.nome)
            if (vecchioOrario !== undefined && vecchioOrario.preferito) orario.preferito = true
          }
          // Se ci sono i vecchi preferiti e l'orario che sto controllando ne faceva parte allora lo segno come preferiro
          if (vecchiPreferiti !== undefined &&
            !orario.preferito &&
            vecchiPreferiti.find(vecchioPreferito => vecchioPreferito.nome === orario.nome))
            orario.preferito = true
          return orario
        })
        orari.orariAule = orari.orariAule.map(orario => {
          if (aule !== undefined) {
            const vecchioOrario = aule.find(aula => aula.nome === orario.nome)
            if (vecchioOrario !== undefined && vecchioOrario.preferito) orario.preferito = true
          }
          // Se ci sono i vecchi preferiti e l'orario che sto controllando ne faceva parte allora lo segno come preferiro
          if (vecchiPreferiti !== undefined &&
            !orario.preferito &&
            vecchiPreferiti.find(vecchioPreferito => vecchioPreferito.nome === orario.nome))
            orario.preferito = true
          return orario
        })
        orari.orariProfessori = orari.orariProfessori.map(orario => {
          if (professori !== undefined) {
            const vecchioOrario = professori.find(professore => professore.nome === orario.nome)
            if (vecchioOrario !== undefined && vecchioOrario.preferito) orario.preferito = true
          }
          // Se ci sono i vecchi preferiti e l'orario che sto controllando ne faceva parte allora lo segno come preferiro
          if (vecchiPreferiti !== undefined &&
            !orario.preferito &&
            vecchiPreferiti.find(vecchioPreferito => vecchioPreferito.nome === orario.nome))
            orario.preferito = true
          return orario
        })

        if (vecchiPreferiti !== undefined) {
          // Se ci sono i vecchi preferiti li elimino
          await this.storageMap.delete('preferiti').toPromise()
        } else
          console.log('Vecchi preferiti non trovati')

        // Salvo i nuovi orari, comprensivi delle vecchie preferenze
        await Promise.all([
          this.storageMap.set('Classi', orari.orariClassi).toPromise(),
          this.storageMap.set('Aule', orari.orariAule).toPromise(),
          this.storageMap.set('Professori', orari.orariProfessori).toPromise()
        ])
      })
    })
  }

  public async cercaOrari(valoreRicerca: string, filtroRicerca: ('Classi' | 'Aule' | 'Professori')[]) {
    let orari: Orario[] = []
    const regex = RegExp(valoreRicerca, 'i')

    // Recupero gli orari in base ai filtri controllando il valore di ricerca
    if (filtroRicerca === undefined || filtroRicerca.includes('Classi'))
      orari.push(...(await this.storageMap.get('Classi').toPromise() as Orario[])
        .filter(orario => regex.test(orario.nome))
        .map(orario => {
          orario.tipo = 'Classe'
          orario.collection = 'Classi'
          return orario
        }))
    if (filtroRicerca === undefined || filtroRicerca.includes('Aule'))
      orari.push(...(await this.storageMap.get('Aule').toPromise() as Orario[])
        .filter(orario => regex.test(orario.nome))
        .map(orario => {
          orario.tipo = 'Aula'
          orario.collection = 'Aule'
          return orario
        }))
    if (filtroRicerca === undefined || filtroRicerca.includes('Professori'))
      orari.push(...(await this.storageMap.get('Professori').toPromise() as Orario[])
        .filter(orario => regex.test(orario.nome))
        .map(orario => {
          orario.tipo = 'Professore'
          orario.collection = 'Professori'
          return orario
        }))

    return orari
  }

  public async ottieniOrario(collection: 'Classi' | 'Aule' | 'Professori', nome: string) {
    const risultati = (await this.cercaOrari(nome, [collection]))

    if (risultati.length === 0) return null
    else return risultati[0]
  }

  public async ottieniPreferiti() {
    const preferiti: Orario[] = []

    // Per mantenere la retrocompatibilità recupero anche eventuali elementi presenti nella sezione 'preferiti'
    const vecchiPreferiti = await this.storageMap.get('preferiti').toPromise() as Orario[]

    const filtroOrari = (orario: Orario) => orario.preferito || (vecchiPreferiti !== undefined && vecchiPreferiti.find(vecchioPreferito => vecchioPreferito.nome === orario.nome))

    // Recupero tutti gli orari con il flag preferito a true
    const classi = await this.storageMap.get('Classi').toPromise() as Orario[]
    const aule = await this.storageMap.get('Aule').toPromise() as Orario[]
    const professori = await this.storageMap.get('Professori').toPromise() as Orario[]

    if (classi !== undefined)
      preferiti.push(...classi.filter(filtroOrari).map(orario => {
        orario.tipo = 'Classe'
        orario.collection = 'Classi'
        return orario
      }))
    if (aule !== undefined)
      preferiti.push(...aule.filter(filtroOrari).map(orario => {
        orario.tipo = 'Aula'
        orario.collection = 'Aule'
        return orario
      }))
    if (professori !== undefined)
      preferiti.push(...professori.filter(filtroOrari).map(orario => {
        orario.tipo = 'Professore'
        orario.collection = 'Professori'
        return orario
      }))

    return preferiti
  }

  /**
   * Trovo n impegni all'interno dell'orario specificato a partire dall'ora e dal giorno indicati
   * @param ora ora da cui partire
   * @param giorno giorno da cui partire
   * @param orario orario da controllare
   * @param numeroImpegni numero di impegni da estrarre, è possibile impostarlo ad Infinity, verranno recuperati tutti gli impegni!
   */
  trovaProssimiImpegni(ora: number, giorno: number, orario: Orario, numeroImpegni: number) {
    let oraPartenza = ora
    let giornoPartenza = giorno
    let oraFine = ora
    let giornoFine = giorno

    const impegni: ProssimoImpegno[] = []

    for (let i = 0; i < numeroImpegni; i++) {
      const impegno = this.trovaProssimoImpegno(oraPartenza, giornoPartenza, oraFine, giornoFine, orario)

      if (impegno !== undefined) {
        oraPartenza = impegno.ora + 1
        giornoPartenza = impegno.giorno

        if (impegni.length === 0) {
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
   * Permette di trovare un impegno successivo a uno dato all'interno di un orario
   * @param oraPartenza Ora dalla quale cercare
   * @param giornoPartenza Giorno dal quale cercare
   * @param oraFine Ora fino alla quale cercare
   * @param giornoFine Giorno fino al quale cercare
   * @param orario L'orario da utilizzare per cercare l'impegno
   */
  trovaProssimoImpegno(oraPartenza: number, giornoPartenza: number, oraFine: number, giornoFine: number, orario: Orario): ProssimoImpegno {
    // Nei commenti di questa funzione per ora e giorno corrente si intendono quelli del ciclo for

    // Se l'ora e il giorno di partenza coincidono, diminuisco la dine di un'ora
    if (oraPartenza === oraFine && giornoPartenza === giornoFine) {
      oraFine--
    }

    if (orario === undefined || orario.tabella === undefined) {
      return undefined
    } else {
      let giornoControllo = giornoPartenza
      let oraPartenzaControllo = (oraPartenza < 0 ? 0 : oraPartenza)

      for (let i = 0; i < 6; i++) { // Per ogni giorno
        // Cerco i dati del giorno corrente
        const datiGiornoCorrente = orario.tabella.map(ora => {
          const info: Info | undefined = ora.info.find(info => info.giorno === giornoControllo)

          if (info !== undefined) { // Controllo che sia diverso da undefined perchè assumo che se le info sono definite allora contengono anche dei dati
            return {
              ora: ora.ora,
              elementi: info.elementi
            }
          } else {
            return undefined
          }
        }).filter(giorno => giorno !== undefined)

        //orario.tabelleOrario.tabellaPerGiorni.find(orarioGiorno => orarioGiorno.giorno === giornoControllo)

        if (datiGiornoCorrente !== undefined) {
          for (let k = oraPartenzaControllo; k < 8; k++) { // Per ogni ora
            // Controllo se siamo arrivata alla fine
            if (k === oraFine && giornoControllo === giornoFine) {
              return undefined
            }

            // Cerco i dati dell'ora corrente
            const datiOraCorrenteInfo = datiGiornoCorrente.find(orarioOra => orarioOra.ora === k)

            if (datiOraCorrenteInfo !== undefined) {
              // In questo caso abbiamo trovato il prossimo impegno!
              return {
                ora: k,
                oraLable: this.ottieniLableOra(k),
                giorno: giornoControllo,
                giornoLable: this.ottieniLableGiorno(giornoControllo),
                elementi: (datiOraCorrenteInfo !== undefined ? datiOraCorrenteInfo.elementi : []),
              }
            }
            // Altrimenti se i dati dell'ora corrente sono undefined vuol dire che non c'è alcuna attvitià in quest'ora,
            // passo alla prosssima
          }
        }
        // Se i dati del giorno corrente sono undefined vuol dire che nel giorno corrente non sono previste attvitià,
        // controllo il prossimo giorno

        // Resetto il giorno se passiamo alla settimana successiva
        giornoControllo++
        if (giornoControllo >= 6) {
          giornoControllo = 0
        }

        // Imposto il prossimo orario di partenza come 1 ora
        oraPartenzaControllo = 0
      }
    }
    return undefined
  }

  ottieniLableOra(ora: number) {
    switch (ora) {
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
    switch (giorno) {
      case 0: return 'Lun'
      case 1: return 'Mar'
      case 2: return 'Mer'
      case 3: return 'Gio'
      case 4: return 'Ven'
      case 5: return 'Sab'
      default: return 'Err'
    }
  }

  public async aggiornaOrario(orario: Orario) {
    if (orario.collection !== undefined) {
      // Recupero gli orari
      let orari = await this.storageMap.get(orario.collection).toPromise() as Orario[]

      // Cerco l'orario da modificare
      const indexOrarioSalvato = orari.map((value, index) => [value, index]).find(element => (element[0] as Orario).nome === orario.nome)[1] as number

      // Imposto l'orario salvato preferito in base all'orario fornito alla fiìunzione
      orari[indexOrarioSalvato].preferito = orario.preferito

      // Salvo gli orari in IndexedDB
      await this.storageMap.set(orario.collection, orari).toPromise()
    }
  }
}
