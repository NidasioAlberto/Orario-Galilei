import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaOrariComponent } from './lista-orari.component';

describe('ListaOrariComponent', () => {
  let component: ListaOrariComponent;
  let fixture: ComponentFixture<ListaOrariComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaOrariComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaOrariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
