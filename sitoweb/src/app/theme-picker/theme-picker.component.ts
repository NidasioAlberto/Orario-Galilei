import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss']
})
export class ThemePickerComponent implements OnInit {

  iconName: string = 'brightness_low'
  tema: string = 'light-theme'

  constructor() { }

  ngOnInit() {
  }

  cambiaTema() {
    if (this.tema = 'light-theme') {
      this.tema = 'dark-theme'
      this.iconName = 'brightness_high'
    } else {
      this.tema = 'light-theme'
      this.iconName = 'brightness_low'
    }
  }

}
