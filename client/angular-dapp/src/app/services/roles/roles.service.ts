import { Injectable } from '@angular/core';
import { Role } from '../../models/role';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class RolesService {
  constructor(private httpClient: HttpClient) {
  }
  get(): Observable<Role[]> {
    return this.httpClient.get<Role[]>(`${environment.BACKEND_URL}/roles`,
      { withCredentials: true })
      .pipe(tap(roles => localStorage.setItem('roles', JSON.stringify(roles))));
  }
}
