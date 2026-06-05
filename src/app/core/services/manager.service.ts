import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { filter, finalize, map, Observable, tap } from 'rxjs';

import { mapRunQuery } from '../firebase/api.adapters';

import { mapUserFromApi } from '../utils/api-formatter';

import { UserFromApi } from '../models/responses-from-api.model';
import { Admin, BaseUser, Customer, Manager } from '../models/user.model';

import { BASE_URL } from '../contsants/base.const';

import { UserRole } from '../../shared/enums/user-roles.enum';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private managerList$ = signal<Manager[]>([]);

  private isManagerListLoaded = false;

  private http = inject(HttpClient);

  private getManagersUrl(managerId: string | null) {
    let managersUrl = `${BASE_URL}/users`;

    if (managerId !== null) {
      managersUrl += `/${managerId}`;
    }

    return managersUrl;
  }

  isManager(user: BaseUser | Customer | Manager | Admin): user is Manager {
    return user.role === UserRole.MANAGER;
  }

  setIsManagerListLoaded(updatedState: boolean) {
    this.isManagerListLoaded = updatedState;
  }

  getManagerList$() {
    return this.managerList$;
  }

  updateManagerList$(newManagerList: Manager[]) {
    this.managerList$.set(newManagerList);
  }

  clearManagerList$() {
    this.managerList$.set([]);
  }

  getManagerList(): void {
    if (this.isManagerListLoaded) return;

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
              integerValue: 1,
            },
          },
        },
      },
    };

    this.http
      .post<UserFromApi[]>(url, body)
      .pipe(
        map((res) => mapRunQuery(res)),
        map((users) => users.map(mapUserFromApi)),
        map((users) => users.filter(this.isManager)),
        map((users) => users.sort((a, b) => a.firstName.localeCompare(b.firstName))),
        tap((list) => this.updateManagerList$(list)),
        finalize(() => this.setIsManagerListLoaded(true)),
      )
      .subscribe();
  }

  getManager(managerId: string): Observable<Manager> {
    const url = this.getManagersUrl(managerId);

    return this.http.get<UserFromApi>(url).pipe(
      map((res) => mapUserFromApi(res)),
      filter((user): user is Manager => user.role === UserRole.MANAGER),
    );
  }

  createManager(newManager: Partial<Manager>, newManagerId: string) {
    const url = this.getManagersUrl(newManagerId);
    const body = this.createManagerApiBody(newManager);

    return this.http.patch(url, body).pipe(finalize(() => this.setIsManagerListLoaded(false)));
  }

  updateManager(editedManager: Manager) {
    const url = this.getManagersUrl(editedManager.id);
    const body = this.createManagerApiBody(editedManager);

    return this.http.patch(url, body).pipe(finalize(() => this.setIsManagerListLoaded(false)));
  }

  deleteManager(managerId: string) {
    const url = this.getManagersUrl(managerId);

    return this.http.delete(url).pipe(finalize(() => this.setIsManagerListLoaded(false)));
  }

  private createManagerApiBody(manager: Partial<Manager>) {
    const { firstName, lastName, email, department, phone, createdBy } = manager;

    return {
      fields: {
        role: { integerValue: UserRole.MANAGER },
        firstName: { stringValue: firstName || '' },
        lastName: { stringValue: lastName || '' },
        email: { stringValue: email || '' },
        department: { stringValue: department || '' },
        createdBy: { stringValue: createdBy || '' },
        phone: { stringValue: phone || '' },
      },
    };
  }

  logoutFromApp() {
    this.setIsManagerListLoaded(false);
    this.clearManagerList$();
  }
}
