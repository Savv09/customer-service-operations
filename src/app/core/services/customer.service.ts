import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { formatCustomerFromFirestore } from '../utils/api-formatter';

import { Customer } from '../models/customer.model';
import { CustomerListFromApi } from '../models/responses-from-api.model';

import { BASE_URL } from '../contsants/base.const';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);

  private getCustomersUrl(customerId: string | null) {
    let customersUrl = `${BASE_URL}/customers`;

    if (customerId !== null) {
      customersUrl += `/${customerId}`;
    }

    return customersUrl;
  }

  getCustomerList(): Observable<Customer[]> {
    const url = this.getCustomersUrl(null);

    return this.http
      .get<CustomerListFromApi>(url)
      .pipe(
        map((res) =>
          res.documents.map((costumerFromApi) => formatCustomerFromFirestore(costumerFromApi)),
        ),
      );
  }
}
