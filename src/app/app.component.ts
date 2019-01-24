import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { merge, Observable } from 'rxjs';
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  tap
} from 'rxjs/operators';
import { ComputeService, ComputeOptions, ComputeProperty } from './compute.service';
import { ComputeFieldOptions } from './compute-field.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data$: Observable<any>;
  compute$: Observable<any>;
  list$: Observable<any>;
  pendingCompute = 0;
  test = 0;
  title = 'app';
  form = this.formBuilder.group({
    price: [0],
    tax: [0]
  }, {updateOn: 'blur'});

  taxComputeOptions: ComputeFieldOptions = {
    computeProperty: ComputeProperty.Tax,
    beforeComputeCallback: (val, deal) => {
      deal.tax = parseFloat(val);
    }
  };

  priceComputeOptions: ComputeFieldOptions = {
    computeProperty: ComputeProperty.Price,
    beforeComputeCallback: (val, deal) => {
      deal.price = parseFloat(val);
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private computeService: ComputeService
  ) {}

  ngOnInit() {
    this.computeService.listen().subscribe((x) => {
      console.log('first');
      this.form.patchValue(x, {emitEvent: false});
    });
    this.computeService.listen().subscribe((x) => {
      console.log('asdasd');
      this.form.patchValue(x, {emitEvent: false});
    });
  }
}
