import { Component, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { AuthService, User } from "../services/auth.service";
import { Subject, takeUntil } from "rxjs";
import { JsonPipe } from "@angular/common";
import { IonAvatar, IonChip, IonLabel } from "@ionic/angular/standalone";

@Component({
    selector: "app-userbar",
    template: `
        @if (user() !== null) {
            <div>
                <ion-chip>
                    <ion-avatar>
                        <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                    </ion-avatar>
                    <ion-label color="light">
                        {{ user()?.email }}
                    </ion-label>
                </ion-chip>
            </div>
        }
    `,
    styles: [``],
    imports: [
    IonAvatar,
    IonChip,
    IonLabel
],
})
export class UserbarComponent implements OnInit, OnDestroy {
    authService = inject(AuthService);
    destroy$ = new Subject<void>();
    
    user: WritableSignal<User | null> = signal(null);

    constructor() {
    }

    ngOnInit(): void {
       this.authService.user$
           .pipe(takeUntil(this.destroy$))
           .subscribe(user => {
                this.user.set(user);
               console.log(user);
           });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}