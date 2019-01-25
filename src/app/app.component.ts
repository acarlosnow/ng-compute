import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  ComputeFieldOptions,
  ComputeProperty,
  ComputeService
} from './compute';

export interface DealModel {
  tax?: number;
  price?: number;
  gross?: {
    frontGross?: number;
    backGross?: number;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  list$ = new BehaviorSubject([]);
  pendingCompute = 0;
  title = 'app';
  form = this.formBuilder.group({
    price: [0],
    tax: [0],
    gross: this.formBuilder.group({
      frontGross: [0],
      backGross: [0]
    })
  });

  taxComputeOptions: ComputeFieldOptions<DealModel> = {
    computeProperty: ComputeProperty.Tax,
    valueMapping: (val, deal) => {
      deal.tax = val;
    }
  };

  frontGrossComputeOptions: ComputeFieldOptions<DealModel> = {
    computeProperty: ComputeProperty.FrontGross,
    valueMapping: (val, deal) => {
      deal.gross = deal.gross || {};
      deal.gross.frontGross = val;
    }
  };

  backGrossComputeOptions: ComputeFieldOptions<DealModel> = {
    computeProperty: ComputeProperty.BackGross,
    valueMapping: (val, deal) => {
      deal.gross = deal.gross || {};
      deal.gross.backGross = val;
    }
  };

  priceComputeOptions: ComputeFieldOptions<DealModel> = {
    computeProperty: ComputeProperty.Price,
    valueMapping: (val, deal) => {
      deal.price = val;
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private computeService: ComputeService<DealModel>
  ) {}

  ngOnInit() {
    this.computeService.computed().subscribe(x => {
      console.warn('final computed: ', JSON.stringify(x));
      this.form.patchValue(x, { emitEvent: false });
    });

    this.computeService.computedResult().subscribe(x => {
      this.list$.next([x, ...this.list$.value]);
    });
  }
}
