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
  private computeQueueFinished$ = new Subject<T>();
  private computedResult$ = new Subject<T>();
  private currentFieldChange: ComputeFieldChange = null;
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
    let pendingCompute = 0;
    this.computeQueue$
      .asObservable()
      .pipe(
        tap(() => {
          pendingCompute++;
        }),
        concatMap((request): Observable<T> => {
          const formObj: any = { ...this.data };
          request.valueMapping(formObj);
          console.warn('compute request: ', JSON.stringify(formObj));

          // todo(allan): remove sample request
          return of(true).pipe(
            delay(300),
            map(() => {
              formObj.gross = formObj.gross || {};
              switch (request.computeProperty) {
                case ComputeProperty.Tax: {
                  formObj.tax = generateRandomNumber(300, 1000);
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
          pendingCompute--;
        }),
        filter(() => pendingCompute === 0)
      )
      .subscribe(computedValue => {
        // if compute has finish while user is changing another field
        // then we will revert back the property on the object base
        // on what the user has inputted currently so user will not experience
        // changing of values while he is typing.
        const computeField = this.currentFieldChange;
        if (computeField) {
          computeField.valueMapping(computeField.value, computedValue);
        }

        // emit event that the compute has finished all the items in the queue.
        this.computeQueueFinished$.next(computedValue);
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
    return this.computeQueueFinished$.asObservable();
  }

  public computedResult(): Observable<T> {
    return this.computedResult$.asObservable();
  }
}

function generateRandomNumber(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
