import { Component, inject, Injectable } from "@angular/core";
import { BehaviorSubject, first, tap } from "rxjs";
import { LoginResponse } from "../apiModels/loginResponse";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";

export interface User {
  id: number;
  email: string
}

export interface Token {
  token: string;
  is_admin: boolean;
  role: string;
  issuer: string;
  algorithm: string;
  type: string;
  expires_in: number;
}

export interface TokenData {
  iss: string;
  sub: string;
  exp: number;
  is_admin: boolean;
  role: string;
}

@Injectable({
  "providedIn": "root",
})
export class AuthService {

  private userSubject$ = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject$.asObservable();

  private http = inject(HttpClient);
  private config = inject(ConfigService);




  Authenticate(email: string, password: string) {
    const url = this.config.apiUrl + '/users/login';
    const obs$ = this.http.post<LoginResponse>(url, {
      email: email,
      password: password
    }).pipe(
      first(),
      tap((response: LoginResponse) => {
        const data = this.extractUserDataFromToken(response.token);
        console.log('Token data:', data);
      })
    );
    return obs$;
  }

  extractUserDataFromToken(token: string): TokenData {
    const data = token.split('.')[1];
    const decoded = atob(data);
    return JSON.parse(decoded);
  }
}

