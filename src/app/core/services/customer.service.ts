import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { formatCustomerFromFirestore } from '../utils/api-formatter';

import { Customer } from '../models/customer.model';
import { CustomerFromApi, CustomerListFromApi } from '../models/responses-from-api.model';

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

  getCustomer(customerId: string): Observable<Customer> {
    const url = this.getCustomersUrl(customerId);

    return this.http.get<CustomerFromApi>(url).pipe(map((res) => formatCustomerFromFirestore(res)));
  }

  updateCustomer(editedCustomer: Customer) {
    const url = this.getCustomersUrl(editedCustomer.id);
    const body = this.getCustomerApiBody(editedCustomer);

    return this.http.patch(url, body);
  }

  private getCustomerApiBody(customer: Customer) {
    const { firstName, lastName, email, company, phone, createdBy } = customer;

    return {
      fields: {
        firstName: { stringValue: firstName },
        lastName: { stringValue: lastName },
        email: { stringValue: email },
        company: { stringValue: company },
        createdBy: { stringValue: createdBy },
        phone: { stringValue: !!phone ? phone : '' },
      },
    };
  }
}
