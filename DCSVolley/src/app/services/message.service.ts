import { inject, Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular/standalone";

import { Color } from "@ionic/core";
import { Subject } from "rxjs";

export interface ConfirmOptions {
    message: string;
    acceptBtnTxt?: string;
    acceptBtnColor?: Color;
    declineBtnTxt?: string;
    declineBtnColor?: Color;
    headerText?: string;
}

@Injectable({
    providedIn: "root"
})
export class MessageService {
    
    alertController = inject(AlertController);
    
    newMessage(message: string, color: Color = 'primary', duration: number = 2000) {
        const msg: Message = {
            text: message,
            color: color,
            duration: duration
        };
        this.message$.next(msg);
    }

    async confirm(options: ConfirmOptions): Promise<boolean> {
        const alert = await this.alertController.create({
            header: options.headerText || "Potwierdzenie",
            message: options.message,
            buttons: [
                {
                    text: options.declineBtnTxt || "Nie",
                    role: "cancel",
                    cssClass: `alert-button-${options.declineBtnColor || "medium"}`,
                },
                {
                    text: options.acceptBtnTxt || "Tak",
                    role: "confirm",
                    cssClass: `alert-button-${options.acceptBtnColor || "primary"}`,
                },
            ],
            backdropDismiss: false,
        });
        await alert.present();

        const { role } = await alert.onDidDismiss();
        return role === "confirm" || role === "ok";
    }

    message$ = new Subject<Message>();
    
}


// export type PredefinedColors =
//   | 'primary'
//   | 'secondary'
//   | 'tertiary'
//   | 'success'
//   | 'warning'
//   | 'danger'
//   | 'light'
//   | 'medium'
//   | 'dark';
export interface Message {
    text: string;
    color: Color; 
    duration: number; 
}