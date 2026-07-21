import { Component, inject } from "@angular/core";
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
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    ReactiveFormsModule,
  ],
})
export class LoginPage {
  loadingCtrl = inject(LoadingController);
  loginForm = new FormGroup({
    email: new FormControl("", [Validators.email, Validators.required]),
    password: new FormControl("", Validators.required),
  });

  constructor() {
   addIcons({ personOutline });
   addIcons({ lockClosedOutline }); 
  }
  
  async test(event: Event) {
    console.log("test");
    const loading = await this.loadingCtrl.create({
      message: "Logging in...",
      spinner: "crescent",
    });
    await loading.present();
    setTimeout(() => {
      loading.dismiss();
    }, 2000);
  }
}