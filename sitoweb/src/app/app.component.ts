import { Component, OnInit } from '@angular/core';
import { StorageService } from './core/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sitoweb';

  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.storage.caricaOrariCompleti()
  }
}
