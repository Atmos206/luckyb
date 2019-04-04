import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader/loader.component';
import { SvgcardComponent } from '../svgcard/svgcard.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LoaderComponent, SvgcardComponent],
  exports: [LoaderComponent, SvgcardComponent]
})
export class SharedModule {}
