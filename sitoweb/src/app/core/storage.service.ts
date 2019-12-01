import { Injectable } from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage'
import { HttpClient } from '@angular/common/http'
import { Orario } from '../utils/orario.model'
import { StorageMap } from '@ngx-pwa/local-storage'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: AngularFireStorage,
    private http: HttpClient,
    private storageMap: StorageMap
  ) { }

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
        console.log(orari)

        // Salvo tutti gli orari in IndexedDB
        await Promise.all([
          this.storageMap.set('classi', orari.orariClassi).toPromise(),
          this.storageMap.set('aule', orari.orariAule).toPromise(),
          this.storageMap.set('professori', orari.orariProfessori).toPromise()
        ])
      })
    })
  }

  public async cercaOrari(valoreRicerca: string, filtroRicerca: ('Classi' | 'Aule' | 'Professori')[]) {
    let orari: Orario[] = []

    // Recupero gli orari in base ai filtri
    if (filtroRicerca === undefined || filtroRicerca.includes('Classi'))
      orari.push(...(await this.storageMap.get('classi').toPromise() as Orario[]))
    if (filtroRicerca === undefined || filtroRicerca.includes('Aule'))
      orari.push(...(await this.storageMap.get('aule').toPromise() as Orario[]))
    if (filtroRicerca === undefined || filtroRicerca.includes('Professori'))
      orari.push(...(await this.storageMap.get('professori').toPromise() as Orario[]))

    // Filtro per il valore di ricerca
    const regex = RegExp(valoreRicerca, 'i')
    return orari.filter(orario => regex.test(orario.nome))
  }
}
