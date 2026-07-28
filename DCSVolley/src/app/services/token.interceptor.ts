
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { first, Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { MessageService } from './message.service';


interface TokenEndpoint {
    pattern: string;
    method: string;
}

const tokenEndpoints: TokenEndpoint[] = [
    { pattern: '\/api\/tournaments\/?', method: 'POST' },
];

function isMatch(endpoint: TokenEndpoint, method: string, url: string): boolean {
    const regex = new RegExp(endpoint.pattern);
    return endpoint.method.toLowerCase() === method.toLowerCase() && regex.test(url);
}

export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const authService = inject(AuthService);
    const messageService = inject(MessageService);
    
    return authService.token$.pipe(
        first(),
        switchMap(token => {
            if (!token) {
                return next(req);
            }

            if (token.expires_in < Date.now() / 1000) {
                authService.logout();
                messageService.newMessage('Session expired. Please log in again.', 'danger', 3000);
                return next(req);
            }


            if (tokenEndpoints.some(endpoint => isMatch(endpoint, req.method, req.url))) {
                const clonedReq = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token.token}`
                    }
                });
                return next(clonedReq);
            }
            return next(req);
        })
    )
}