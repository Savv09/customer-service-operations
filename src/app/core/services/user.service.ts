import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs';
import { UserFromApi } from '../models/responses-from-api.model';
import { BASE_URL } from '../contsants/base.const';
import { BaseUser } from '../models/user.model';
import { mapUserToDomain } from '../utils/api-formatter';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user = signal<BaseUser | null>(null);

  private http = inject(HttpClient);

  private getUsersUrl(userId: string | null) {
    let usersUrl = `${BASE_URL}/users`;

    if (userId !== null) {
      usersUrl += `/${userId}`;
    }

    return usersUrl;
  }

  getUserList() {}

  getUser(userId: string) {
    const url = this.getUsersUrl(userId);

    this.http
      .get<UserFromApi>(url)
      .pipe(map((res) => mapUserToDomain(res)))
      .subscribe((user) => this.user.set(user));
  }

  clearUser() {
    this.user.set(null);
  }
}
