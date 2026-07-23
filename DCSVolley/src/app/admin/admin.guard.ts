// (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => MaybeAsync<GuardResult>;

import { ActivatedRouteSnapshot, GuardResult, MaybeAsync, RedirectCommand, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { map, take } from "rxjs";

export function canActivateAdmin(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const userSvc = inject(AuthService);
    return userSvc.user$.pipe(
        take(1),
        map(user => {
            return user?.role === 'admin';
        })
    );
}