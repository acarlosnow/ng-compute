import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { concatMap, delay, filter, map, tap } from 'rxjs/operators';
import {
  ComputeFieldChange,
  ComputeOptions,
  ComputeProperty,
} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ComputeService<T = any> {
  /*******************
   * Private property
   */
  private computeQueue$ = new Subject<ComputeOptions>();
  private computedResult$ = new Subject<T>();
  private currentFieldChange: ComputeFieldChange = null;
  private queueFinished$ = new Subject<T>();
  private pendingCompute = 0;
  private data: T = null;

  /*******************
   * Constructor
   */
  constructor() {
    this.listenForComputes();
  }

  /*******************
   * Private methods
   */
  private listenForComputes() {
    this.computeQueue$
      .asObservable()
      .pipe(
        tap(() => {
          this.pendingCompute++;
        }),
        concatMap(request => {
          const formObj: any = { ...this.data };
          request.valueMapping(formObj);
          console.warn('compute request: ', JSON.stringify(formObj));

          // todo(allan): remove sample request
          return of(true).pipe(
            delay(800),
            map(() => {
              formObj.gross = formObj.gross || {};
              switch (request.computeProperty) {
                case ComputeProperty.Tax: {
                  formObj.price = generateRandomNumber(300, 1000);
                  formObj.gross.frontGross = generateRandomNumber(300, 1000);
                  formObj.gross.backGross = generateRandomNumber(300, 1000);
                  break;
                }
                case ComputeProperty.Price: {
                  formObj.gross.frontGross = generateRandomNumber(300, 1000);
                  formObj.gross.backGross = generateRandomNumber(300, 1000);
                  formObj.tax = generateRandomNumber(300, 1000);
                  break;
                }
                case ComputeProperty.FrontGross: {
                  formObj.price = generateRandomNumber(300, 1000);
                  formObj.gross.backGross = generateRandomNumber(300, 1000);
                  formObj.tax = generateRandomNumber(300, 1000);
                  break;
                }
                case ComputeProperty.BackGross: {
                  formObj.price = generateRandomNumber(300, 1000);
                  formObj.gross.frontGross = generateRandomNumber(300, 1000);
                  formObj.tax = generateRandomNumber(300, 1000);
                  break;
                }
              }
              this.data = formObj;
              return formObj;
            }),
            tap(x => {
              this.computedResult$.next(x);
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
        const computeField = this.currentFieldChange;
        // todo: mapping back last field that change
        if (computeField) {
          computeField.valueMapping(computeField.value, x);
        }
        this.queueFinished$.next(x);
      });
  }

  /*******************
   * Public methods
   */
  public compute(options: ComputeOptions): void {
    if (!options) {
      return;
    }

    this.computeQueue$.next(options);
  }

  public setLastFieldChange(fieldChange: ComputeFieldChange) {
    this.currentFieldChange = fieldChange;
  }

  public computed(): Observable<T> {
    return this.queueFinished$.asObservable();
  }

  public computedResult(): Observable<T> {
    return this.computedResult$.asObservable();
  }
}

function generateRandomNumber(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
