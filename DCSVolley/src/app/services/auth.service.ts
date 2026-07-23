import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, first, map, tap } from "rxjs";
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
  
  private tokenSubject$ = new BehaviorSubject<Token | null>(null);
  public token$ = this.tokenSubject$.asObservable();

  private http = inject(HttpClient);
  private config = inject(ConfigService);

  constructor() {
    // if available load user and token from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject$.next(JSON.parse(storedUser));
    }

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.tokenSubject$.next(JSON.parse(storedToken));
    }

    // store user and token after each change in local storage
    this.user$.subscribe(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    });

    this.token$.subscribe(token => {
      if (token) {
        localStorage.setItem('token', JSON.stringify(token));
      } else {
        localStorage.removeItem('token');
      }
    });

  }


  Authenticate(email: string, password: string) {
    const url = this.config.apiUrl + '/users/login';

    const obs$ = this.http.post<LoginResponse>(url, {
      email: email,
      password: password
    }).pipe(
      first(),
      map((response: LoginResponse) => {
        const data = this.extractUserDataFromToken(response.token);
        return { data, response };
      }),
      tap(({ data }: { data: TokenData; response: LoginResponse }) => {
        const user: User = {
          id: parseInt(data.sub),
          email: email
        };
        this.userSubject$.next(user);
      }),
      tap(({ data, response }: { data: TokenData; response: LoginResponse }) => {
       const token: Token = {
        token: response.token,
        is_admin: data.is_admin,
        role: data.role,
        issuer: data.iss, // You might need to extract this from the token if available
        algorithm: "", // You might need to extract this from the token if available
        type: "", // You might need to extract this from the token if available
        expires_in: data.exp,
       };
       this.tokenSubject$.next(token);
      }),
    );
    return obs$;
  }

  extractUserDataFromToken(token: string): TokenData {
    const data = token.split('.')[1];
    const decoded = atob(data);
    return JSON.parse(decoded);
  }
}

