import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoOrarioComponent } from './grafico-orario.component';

describe('GraficoOrarioComponent', () => {
  let component: GraficoOrarioComponent;
  let fixture: ComponentFixture<GraficoOrarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraficoOrarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficoOrarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
