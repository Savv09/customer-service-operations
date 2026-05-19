import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, Observable } from 'rxjs';

import { formatCustomerFromFirestore } from '../utils/api-formatter';

import { Customer } from '../models/customer.model';
import { CustomerFromApi, CustomerListFromApi } from '../models/responses-from-api.model';

import { BASE_URL } from '../contsants/base.const';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private customerList$ = signal<Customer[]>([]);

  private isCustomerListLoaded = false;

  private http = inject(HttpClient);

  private getCustomersUrl(customerId: string | null) {
    let customersUrl = `${BASE_URL}/customers`;

    if (customerId !== null) {
      customersUrl += `/${customerId}`;
    }

    return customersUrl;
  }

  getCustomerList(): void {
    if (this.isCustomerListLoaded) return;

    const url = this.getCustomersUrl(null);

    this.http
      .get<CustomerListFromApi>(url)
      .pipe(
        map((res) =>
          res.documents.map((costumerFromApi) => formatCustomerFromFirestore(costumerFromApi)),
        ),
        map((customers) => customers.sort((a, b) => a.firstName.localeCompare(b.firstName))),
        map((customerList) => this.updateCustomerList$(customerList)),
        finalize(() => this.setIsCustomerListLoaded(true)),
      )
      .subscribe();
  }

  getCustomer(customerId: string): Observable<Customer> {
    const url = this.getCustomersUrl(customerId);

    return this.http.get<CustomerFromApi>(url).pipe(map((res) => formatCustomerFromFirestore(res)));
  }

  createCustomer(newCustomer: Partial<Customer>) {
    const url = this.getCustomersUrl(null);
    const body = this.createCustomerApiBody(newCustomer);

    return this.http.post(url, body).pipe(finalize(() => this.setIsCustomerListLoaded(false)));
  }

  updateCustomer(editedCustomer: Customer) {
    const url = this.getCustomersUrl(editedCustomer.id);
    const body = this.createCustomerApiBody(editedCustomer);

    return this.http.patch(url, body).pipe(finalize(() => this.setIsCustomerListLoaded(false)));
  }

  deleteCustomer(customerId: string) {
    const url = this.getCustomersUrl(customerId);

    return this.http.delete(url).pipe(finalize(() => this.setIsCustomerListLoaded(false)));
  }

  private createCustomerApiBody(customer: Partial<Customer>) {
    const { firstName, lastName, email, company, phone, createdBy } = customer;

    return {
      fields: {
        firstName: { stringValue: firstName || '' },
        lastName: { stringValue: lastName || '' },
        email: { stringValue: email || '' },
        company: { stringValue: company || '' },
        createdBy: { stringValue: createdBy || '' },
        phone: { stringValue: phone || '' },
      },
    };
  }

  getCustomerList$() {
    return this.customerList$;
  }

  updateCustomerList$(newCustomerList: Customer[]) {
    this.customerList$.set(newCustomerList);
  }

  clearCustomerList$() {
    this.customerList$.set([]);
  }

  setIsCustomerListLoaded(updatedState: boolean) {
    this.isCustomerListLoaded = updatedState;
  }
}
