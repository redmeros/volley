import { Component, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { AuthService, User } from "../services/auth.service";
import { Subject, takeUntil } from "rxjs";
import { JsonPipe } from "@angular/common";
import { IonAvatar, IonChip, IonLabel, IonPopover, IonContent, IonList, IonItem } from "@ionic/angular/standalone";
import { Router } from "@angular/router";

@Component({
    selector: "app-userbar",
    template: `
        @if (user() !== null) {
            <div>
                <ion-chip id="popover-userbar">
                    <ion-avatar>
                        <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                    </ion-avatar>
                    <ion-label color="light">
                        {{ user()?.email }}
                    </ion-label>
                </ion-chip>
                <ion-popover trigger="popover-userbar" side="bottom" alignment="center" [dismissOnSelect]="true">
                    <ng-template>
                        <ion-content>
                            <ion-list>
                                <ion-item [button]="true" [detail]="false" (click)="logoutClicked($event)">
                                    <ion-label>
                                        <h2>Wyloguj</h2>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-content>
                    </ng-template>
                </ion-popover>
            </div>
        }
    `,
    styles: [``],
    imports: [
    IonAvatar,
    IonChip,
    IonLabel,
    IonPopover,
    IonContent,
    IonList,
    IonItem
],
})
export class UserbarComponent implements OnInit, OnDestroy {
    authService = inject(AuthService);
    router = inject(Router);     

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
    
    logoutClicked(event: Event) {
        // event.preventDefault();
        this.authService.logout();
        this.router.navigate(['/']);
    }
}