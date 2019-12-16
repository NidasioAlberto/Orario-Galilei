import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ServiceWorkerModule } from '@angular/service-worker'
import { FormsModule } from '@angular/forms'
import { ScrollingModule } from '@angular/cdk/scrolling'

// Environment
import { environment } from '../environments/environment'

// Moduli firebase e storage
import { StorageModule } from '@ngx-pwa/local-storage'
import { AngularFireModule } from '@angular/fire'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFirePerformanceModule } from '@angular/fire/performance'
import { AngularFireStorageModule } from '@angular/fire/storage'

// Componenti angular material
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatIconModule } from '@angular/material/icon'
import { MatChipsModule } from '@angular/material/chips'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatProgressBarModule } from '@angular/material/progress-bar'

// Componenti app
import { NavbarComponent } from './navbar/navbar.component'
import { RicercaComponent } from './ricerca/ricerca.component'
import { ListaOrariComponent } from './lista-orari/lista-orari.component'
import { ElementoListaOrariComponent } from './lista-orari/elemento-lista-orari/elemento-lista-orari.component'
import { ListaImpegniComponent } from './lista-impegni/lista-impegni.component'
import { OrarioComponent } from './orario/orario.component'
import { GraficoOrarioComponent } from './orario/grafico-orario/grafico-orario.component'
import { PreferitiComponent } from './preferiti/preferiti.component';
import { InformazioniComponent } from './informazioni/informazioni.component'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RicercaComponent,
    ListaOrariComponent,
    ElementoListaOrariComponent,
    ListaImpegniComponent,
    OrarioComponent,
    GraficoOrarioComponent,
    PreferitiComponent,
    InformazioniComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    FormsModule,
    ScrollingModule,

    // Moduli firebase e storage
    StorageModule.forRoot({ IDBNoWrap: true }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFirePerformanceModule,
    AngularFireStorageModule,

    // Componenti angular material
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
