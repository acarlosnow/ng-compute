import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  tap
} from 'rxjs/operators';
import { ComputeService } from './compute.service';
import { ComputeFieldOptions } from './interfaces';

@Directive({
  selector: '[appComputeField]'
})
export class ComputeFieldDirective implements OnInit, OnDestroy {
  /*****************
   * Public properties
   */
  @Input('appComputeField') computeFieldOptions: ComputeFieldOptions;

  /*****************
   * Private properties
   */
  private destroyed$ = new Subject();

  /*****************
   * Contructor
   */
  constructor(
    @Optional() private control: NgControl,
    private computeService: ComputeService
  ) {}

  /*****************
   * View life cycle
   */
  ngOnInit() {
    this.control.valueChanges
      .pipe(
        tap(value =>
          this.computeService.setLastFieldChange({
            value: value,
            valueMapping: this.computeFieldOptions.valueMapping
          })
        ),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(x => {
        const ops = this.computeFieldOptions;
        this.computeService.compute({
          valueMapping: deal => {
            ops.valueMapping(x, deal);
          },
          computeProperty: ops.computeProperty,
          computescenario: ops.computescenario
        });
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
