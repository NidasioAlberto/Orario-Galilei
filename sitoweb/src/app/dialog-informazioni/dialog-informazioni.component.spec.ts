import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInformazioniComponent } from './dialog-informazioni.component';

describe('DialogInformazioniComponent', () => {
  let component: DialogInformazioniComponent;
  let fixture: ComponentFixture<DialogInformazioniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogInformazioniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInformazioniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
