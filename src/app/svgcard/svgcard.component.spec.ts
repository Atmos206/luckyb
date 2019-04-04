import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgcardComponent } from './svgcard.component';

describe('SvgcardComponent', () => {
  let component: SvgcardComponent;
  let fixture: ComponentFixture<SvgcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SvgcardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
