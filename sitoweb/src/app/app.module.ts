import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { RicercaComponent } from './ricerca/ricerca.component';
import { ElementoRicercaComponent } from './ricerca/elemento-ricerca/elemento-ricerca.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OrarioComponent } from './orario/orario.component';
import { GraficoOrarioComponent } from './orario/grafico-orario/grafico-orario.component';
import { ListaImpegniComponent } from './utils/lista-impegni/lista-impegni.component'


@NgModule({
  declarations: [
    AppComponent,
    RicercaComponent,
    ElementoRicercaComponent,
    OrarioComponent,
    GraficoOrarioComponent,
    ListaImpegniComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    ScrollingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
