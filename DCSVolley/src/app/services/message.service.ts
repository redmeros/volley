import { Injectable } from "@angular/core";

import { Color } from "@ionic/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class MessageService {
    
    newMessage(message: string, color: Color = 'primary', duration: number = 2000) {
        const msg: Message = {
            text: message,
            color: color,
            duration: duration
        };
        this.message$.next(msg);
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