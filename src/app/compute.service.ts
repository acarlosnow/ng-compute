import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { tap, concatMap, filter, map, delay } from 'rxjs/operators';

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
  private queueFinished$ = new Subject<DealModel>();
  private pendingCompute = 0;

  constructor() {
    this.queue$
      .asObservable()
      .pipe(
        tap(() => {
          this.pendingCompute++;
          console.warn('queued compute...', this.pendingCompute);
        }),
        concatMap(request => {
          const formObj: DealModel = {
            tax: 10,
            price: 20
          };
          request.beforeComputeCallback(formObj);
          console.log('prepare compute', formObj);
          return of(true).pipe(
            delay(1000),
            map(() => {
              return <DealModel>{
                tax: generateRandomNumber(0, 100),
                price: generateRandomNumber(300, 1000)
              };
            }),
            tap(() => {
              console.warn('resolved compute', this.pendingCompute);
            })
          );
        }),
        tap(() => {
          this.pendingCompute--;
        }),
        filter(() => this.pendingCompute === 0)
      )
      .subscribe(x => {
        this.queueFinished$.next(x);
      });
  }

  public compute(options: ComputeOptions): void {
    if (!options) {
      return;
    }

    this.queue$.next(options);
  }

  public listen(): Observable<DealModel> {
    return this.queueFinished$.asObservable();
  }
}

function generateRandomNumber(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
