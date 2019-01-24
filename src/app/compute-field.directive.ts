import { Directive, Optional, OnInit, Input, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import {
  ComputeService,
  DealModel,
  ComputeProperty,
  ComputeScenario
} from './compute.service';
import { distinctUntilChanged, debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface ComputeFieldOptions {
  computeProperty?: ComputeProperty;
  computescenario?: ComputeScenario;
  beforeComputeCallback?: BeforeComputeFieldCallback;
}

export type BeforeComputeFieldCallback = (value: any, deal: DealModel) => void;

@Directive({
  selector: '[appComputeField]'
})
export class ComputeFieldDirective implements OnInit, OnDestroy {
  @Input('appComputeField') computeFieldOptions: ComputeFieldOptions;

  private destroyed$ = new Subject();

  constructor(
    @Optional() private control: NgControl,
    private computeService: ComputeService
  ) {}

  ngOnInit() {
    this.control.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(x => {
        const ops = this.computeFieldOptions;
        this.computeService.compute({
          beforeComputeCallback: deal => {
            ops.beforeComputeCallback(x, deal);
          },
          computeProperty: ops.computeProperty,
          computescenario: ops.computescenario
        });
      });
    this.control.statusChanges.subscribe(x => {
      console.log(x);
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
