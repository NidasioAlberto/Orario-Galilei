import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferitiComponent } from './preferiti.component';

describe('PreferitiComponent', () => {
  let component: PreferitiComponent;
  let fixture: ComponentFixture<PreferitiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreferitiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferitiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
