import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementoListaOrariComponent } from './elemento-lista-orari.component';

describe('ElementoListaOrariComponent', () => {
  let component: ElementoListaOrariComponent;
  let fixture: ComponentFixture<ElementoListaOrariComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementoListaOrariComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementoListaOrariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
