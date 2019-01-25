import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';
import { ComputeFieldDirective } from './compute-field.directive';
import { ComputeService } from './compute.service';

@NgModule({
  declarations: [ComputeFieldDirective],
  imports: [CommonModule],
  exports: [ComputeFieldDirective],
  providers: [ComputeService]
})
export class ComputeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ComputeModule,
      providers: [ComputeService]
    };
  }
}
