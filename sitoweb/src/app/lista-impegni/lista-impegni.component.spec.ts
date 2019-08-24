import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaImpegniComponent } from './lista-impegni.component';

describe('ListaImpegniComponent', () => {
  let component: ListaImpegniComponent;
  let fixture: ComponentFixture<ListaImpegniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaImpegniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaImpegniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
