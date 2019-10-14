import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ServiceWorkerModule } from '@angular/service-worker'
import { environment } from '../environments/environment'

import { AngularFireModule } from '@angular/fire'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFirePerformanceModule } from '@angular/fire/performance'

import { RicercaComponent } from './ricerca/ricerca.component'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { OrarioComponent } from './orario/orario.component'
import { GraficoOrarioComponent } from './orario/grafico-orario/grafico-orario.component'
import { ListaImpegniComponent } from './lista-impegni/lista-impegni.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NavbarComponent } from './navbar/navbar.component'
import { FormsModule } from '@angular/forms'
import { StorageModule } from '@ngx-pwa/local-storage'

// Angular material components
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { PreferitiComponent } from './preferiti/preferiti.component'
import { ListaOrariComponent } from './lista-orari/lista-orari.component'
import { ElementoListaOrariComponent } from './lista-orari/elemento-lista-orari/elemento-lista-orari.component'
import { DialogInformazioniComponent } from './dialog-informazioni/dialog-informazioni.component'

@NgModule({
  declarations: [
    AppComponent,
    RicercaComponent,
    OrarioComponent,
    GraficoOrarioComponent,
    ListaImpegniComponent,
    NavbarComponent,
    PreferitiComponent,
    ListaOrariComponent,
    ElementoListaOrariComponent,
    DialogInformazioniComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFirePerformanceModule,
    ScrollingModule,
    BrowserAnimationsModule,
    FormsModule,

    // Angular material components
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatInputModule,
    MatSnackBarModule,

    StorageModule.forRoot({ IDBNoWrap: true }),
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [DialogInformazioniComponent]
})
export class AppModule { }
