import { Component, inject, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  LoadingController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { personOutline, lockClosedOutline } from "ionicons/icons";
import { MessageService } from "../services/message.service";
import { AuthService } from "../services/auth.service";
import { finalize, first, Subject, takeUntil } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonInput,
    IonItem,
    ReactiveFormsModule
],
})
export class LoginPage implements OnDestroy {

  messageSvc = inject(MessageService);
  authSvc = inject(AuthService);
  loadingCtrl = inject(LoadingController);
  router = inject(Router);
  
  destroy$ = new Subject<void>();

  loginForm = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
    password: new FormControl("", Validators.required),
  });

  constructor() {
    addIcons({ personOutline });
    addIcons({ lockClosedOutline });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async test(event: Event) {
    event.preventDefault();
    const loading = await this.loadingCtrl.create({
      message: "Logging in...",
      spinner: "crescent",
    });
    await loading.present();
    const formData = this.loginForm.getRawValue();

    this.authSvc.Authenticate(formData.email || "", formData.password || "")
      .pipe(
        takeUntil(this.destroy$),
        first(),
        finalize(() => {
          loading.dismiss();
        })
      ).subscribe({
        next: (token) => {
          console.log("Login successful, token received:", token);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.messageSvc.newMessage("Login failed", "danger", 2000);
          console.error("Login failed:", err);
        },
        complete: () => {
          console.log("Login process completed");
        }
      })
    }
}
