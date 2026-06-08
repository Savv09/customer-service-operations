import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs';

import { mapUserFromApi } from '../utils/api-formatter';

import { UserFromApi } from '../models/responses-from-api.model';
import { User } from '../models/user.model';

import { BASE_URL } from '../contsants/base.const';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUser$ = signal<User | null>(null);

  private http = inject(HttpClient);

  private getUsersUrl(userId: string | null) {
    let usersUrl = `${BASE_URL}/users`;

    if (userId !== null) {
      usersUrl += `/${userId}`;
    }

    return usersUrl;
  }

  getUser(userId: string) {
    const url = this.getUsersUrl(userId);

    this.http
      .get<UserFromApi>(url)
      .pipe(map((res) => mapUserFromApi(res)))
      .subscribe((user) => this.updateCurrentUser$(user));
  }

  getCurrentUser$() {
    return this.currentUser$;
  }

  updateCurrentUser$(user: User) {
    this.currentUser$.set(user);
  }

  clearCurrentUser$() {
    this.currentUser$.set(null);
  }
}
