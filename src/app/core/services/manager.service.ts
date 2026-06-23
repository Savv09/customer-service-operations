import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EMPTY, filter, finalize, map, Observable, switchMap, tap } from 'rxjs';

import { mapRunQuery } from '../firebase/api.adapters';

import { mapUserFromApi } from '../utils/api-mapper';

import { UserFromApi } from '../models/responses-from-api.model';
import { Admin, BaseUser, Customer, Manager } from '../models/user.model';

import { BASE_URL } from '../contsants/base.const';

import { UserRole } from '../../shared/enums/user-roles.enum';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private managerList$ = signal<Manager[]>([]);

  private isManagerListLoaded = signal<boolean>(false);

  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

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

  getIsManagerListLoaded() {
    return this.isManagerListLoaded;
  }

  setIsManagerListLoaded(updatedState: boolean) {
    this.isManagerListLoaded.set(updatedState);
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

  getManagerList(): Observable<Manager[]> {
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

    return this.http.post<UserFromApi[]>(url, body).pipe(
      map((res) => mapRunQuery(res)),
      map((users) => users.map(mapUserFromApi)),
      map((users) => users.filter(this.isManager)),
      map((users) => users.sort((a, b) => a.firstName.localeCompare(b.firstName))),
      finalize(() => this.setIsManagerListLoaded(true)),
    );
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

    return this.dialogService
      .confirmOperation('Update Manager', 'Are you sure you want to update this manager info?')
      .pipe(
        switchMap((confirmed) =>
          confirmed
            ? this.http.patch(url, body).pipe(finalize(() => this.setIsManagerListLoaded(false)))
            : EMPTY,
        ),
      );
  }

  deleteManager(managerId: string) {
    const url = this.getManagersUrl(managerId);
    return this.dialogService
      .confirmOperation('Update Manager', 'Are you sure you want to update this manager info?')
      .pipe(
        switchMap((confirmed) =>
          confirmed
            ? this.http.delete(url).pipe(finalize(() => this.setIsManagerListLoaded(false)))
            : EMPTY,
        ),
      );
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
