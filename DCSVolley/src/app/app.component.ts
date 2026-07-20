import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink, IonToast, ToastController, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { balloonOutline, personOutline } from 'ionicons/icons';
import { MessageService } from './services/message.service';

import { Color } from '@ionic/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonButtons, IonToolbar, IonHeader,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonMenuToggle,
    IonMenu,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
    IonToast, IonTitle, IonMenuButton],
})
export class AppComponent implements OnInit, OnDestroy {

  private toastController = inject(ToastController);
  private messageService = inject(MessageService);

  private destroy$ = new Subject<void>();

  constructor() {
    addIcons({ balloonOutline, personOutline });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  ngOnInit(): void {
    const s = this.messageService.message$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        this.toastController.create({
          message: msg.text,
          duration: msg.duration,
          position: 'bottom',
          color: msg.color,
          animated: true,
          buttons: [
            {
              text: 'Zamknij',
              role: 'cancel'
            }
          ]

        }).then(toast => toast.present());

      });
  }



}
