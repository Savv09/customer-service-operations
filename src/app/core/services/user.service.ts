import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '../contsants/base.const';
import { map, Observable } from 'rxjs';
import { formatUserFromFirestore } from '../utils/api-formatter';
import { UserFromApi } from '../models/responses-from-api.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private getUsersUrl(userId: string | null) {
    let usersUrl = `${BASE_URL}/users`;

    if (userId !== null) {
      usersUrl += `/${userId}`;
    }

    return usersUrl;
  }

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    });
  }

  getUserList() {}

  getUser(userId: string): Observable<User> {
    const url = this.getUsersUrl(userId);
    const headers = this.getHeaders();

    return this.http
      .get<UserFromApi>(url, { headers: headers })
      .pipe(map((res) => formatUserFromFirestore(res)));
  }
}
