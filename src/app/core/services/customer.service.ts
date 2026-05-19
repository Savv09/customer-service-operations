import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, finalize, map, Observable, tap } from 'rxjs';

import { mapUserToDomain } from '../utils/api-formatter';

import { UserFromApi } from '../models/responses-from-api.model';

import { BASE_URL } from '../contsants/base.const';
import { BaseUser, Customer, Manager } from '../models/user.model';
import { mapRunQuery } from '../firebase/api.adapters';
import { UserRole } from '../../shared/enums/user-roles.enum';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private customerList$ = signal<Customer[]>([]);

  private isCustomerListLoaded = false;

  private http = inject(HttpClient);

  private getCustomersUrl(customerId: string | null) {
    let customersUrl = `${BASE_URL}/users`;

    if (customerId !== null) {
      customersUrl += `/${customerId}`;
    }

    return customersUrl;
  }

  getCustomerList(): void {
    if (this.isCustomerListLoaded) return;

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

    this.http
      .post<UserFromApi[]>(url, body)
      .pipe(
        map((res) => mapRunQuery(res)),
        map((users) => users.map(mapUserToDomain)),
        map((users) => users.filter(this.isCustomer)),
        map((users) => users.sort((a, b) => a.firstName.localeCompare(b.firstName))),
        tap((list) => this.updateCustomerList$(list)),
        finalize(() => this.setIsCustomerListLoaded(true)),
      )
      .subscribe();
  }

  getCustomer(customerId: string): Observable<Customer> {
    const url = this.getCustomersUrl(customerId);

    return this.http.get<UserFromApi>(url).pipe(
      map((res) => mapUserToDomain(res)),
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
        role: { integerValue: 2 },
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

  isCustomer(user: BaseUser | Customer | Manager): user is Customer {
    return user.role === UserRole.CUSTOMER;
  }
}
