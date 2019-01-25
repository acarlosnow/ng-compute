import { Injectable } from '@angular/core';
import { Observable, Subject, of, BehaviorSubject } from 'rxjs';
import { tap, concatMap, filter, map, delay } from 'rxjs/operators';
import { NgControl } from '@angular/forms';

export interface DealModel {
  tax?: number;
  price?: number;
}

export enum ComputeProperty {
  Tax = 1,
  Price = 2
}

export enum ComputeScenario {
  Default = 1,
  BHPH = 2
}

export type BeforeComputeCallback = (deal: DealModel) => void;

export interface ComputeOptions {
  computeProperty?: ComputeProperty;
  computescenario?: ComputeScenario;
  beforeComputeCallback?: BeforeComputeCallback;
}

@Injectable({
  providedIn: 'root'
})
export class ComputeService {
  private queue$ = new Subject<ComputeOptions>();
  private computeFieldChanges$ = new BehaviorSubject<{
    value: any;
    field: NgControl;
  }>(null);
  private queueFinished$ = new Subject<DealModel>();
  private pendingCompute = 0;
  private data: DealModel = null;
  constructor() {
    this.queue$
      .asObservable()
      .pipe(
        tap(() => {
          this.pendingCompute++;
        }),
        concatMap(request => {
          const formObj: DealModel = {...this.data};
          request.beforeComputeCallback(formObj);
          console.warn('compute request: ', JSON.stringify(formObj));
          return of(true).pipe(
            delay(1000),
            map(() => {
              if (request.computeProperty === ComputeProperty.Tax) {
                formObj.price = generateRandomNumber(300, 1000);
              }
              if (request.computeProperty === ComputeProperty.Price) {
                formObj.tax = generateRandomNumber(0, 100);
              }
              this.data = formObj;
              return formObj;
            }),
            tap(x => {
              console.warn('compute result: ', JSON.stringify(x));
            })
          );
        }),
        tap(() => {
          this.pendingCompute--;
        }),
        filter(() => this.pendingCompute === 0)
      )
      .subscribe(x => {
        const computeField = this.computeFieldChanges$.value;
        // todo: mapping back last field that change
        if (computeField) {
          x[computeField.field.name] = computeField.value;
        }
        this.queueFinished$.next(x);
      });
  }

  public compute(options: ComputeOptions): void {
    if (!options) {
      return;
    }

    this.queue$.next(options);
  }

  public computeFieldChanges(value: any, field: NgControl) {
    this.computeFieldChanges$.next({ value, field: field });
  }

  public listen(): Observable<DealModel> {
    return this.queueFinished$.asObservable();
  }
}

function generateRandomNumber(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
