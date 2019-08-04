import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementoRicercaComponent } from './elemento-ricerca.component';

describe('ElementoRicercaComponent', () => {
  let component: ElementoRicercaComponent;
  let fixture: ComponentFixture<ElementoRicercaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementoRicercaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementoRicercaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
