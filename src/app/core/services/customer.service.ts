import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { filter, finalize, map, Observable, tap } from 'rxjs';

import { mapRunQuery } from '../firebase/api.adapters';

import { mapUserFromApi } from '../utils/api-mapper';

import { UserFromApi } from '../models/responses-from-api.model';
import { Admin, BaseUser, Customer, Manager } from '../models/user.model';

import { BASE_URL } from '../contsants/base.const';

import { UserRole } from '../../shared/enums/user-roles.enum';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private customerList$ = signal<Customer[]>([]);

  private isCustomerListLoaded = signal<boolean>(true);

  private http = inject(HttpClient);

  private getCustomersUrl(customerId: string | null) {
    let customersUrl = `${BASE_URL}/users`;

    if (customerId !== null) {
      customersUrl += `/${customerId}`;
    }

    return customersUrl;
  }

  getCustomerList(): Observable<Customer[]> {
    const url = `${BASE_URL}:runQuery`;
    const body = {
      structuredQuery: {
        from: [
          {
            collectionId: 'users',
          },
        ],
        where: {
          fieldFilter: {
            field: {
              fieldPath: 'role',
            },
            op: 'EQUAL',
            value: {
              integerValue: 2,
            },
          },
        },
      },
    };

    return this.http.post<UserFromApi[]>(url, body).pipe(
      map((res) => mapRunQuery(res)),
      map((users) => users.map(mapUserFromApi)),
      map((users) => users.filter(this.isCustomer)),
      map((users) => users.sort((a, b) => a.firstName.localeCompare(b.firstName))),
      finalize(() => this.setIsCustomerListLoaded(true)),
    );
  }

  getCustomer(customerId: string): Observable<Customer> {
    const url = this.getCustomersUrl(customerId);

    return this.http.get<UserFromApi>(url).pipe(
      map((res) => mapUserFromApi(res)),
      filter((user): user is Customer => user.role === UserRole.CUSTOMER),
    );
  }

  createCustomer(newCustomer: Partial<Customer>, newCustomerId: string) {
    const url = this.getCustomersUrl(newCustomerId);
    const body = this.createCustomerApiBody(newCustomer);

    return this.http.patch(url, body).pipe(finalize(() => this.setIsCustomerListLoaded(false)));
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
        role: { integerValue: UserRole.CUSTOMER },
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

  getIsCustomerListLoaded() {
    return this.isCustomerListLoaded;
  }

  setIsCustomerListLoaded(updatedState: boolean) {
    this.isCustomerListLoaded.set(updatedState);
  }

  isCustomer(user: BaseUser | Customer | Manager | Admin): user is Customer {
    return user.role === UserRole.CUSTOMER;
  }

  logoutFromApp() {
    this.setIsCustomerListLoaded(false);
    this.clearCustomerList$();
  }
}
