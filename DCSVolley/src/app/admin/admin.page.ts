import { Component, inject } from "@angular/core";
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFab, IonIcon, IonFabButton, IonButton, ModalController } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { addOutline } from "ionicons/icons";
import { TournamentForm } from "./tournament.form";

@Component({
    selector: 'app-admin',
    templateUrl: './admin.page.html',
    imports: [IonIcon, IonCardContent, IonCardTitle, IonCardHeader, IonContent, IonCard, IonButton],
    styles: [`
        div.title {
            display: flex;
            justify-content: space-between;
        }`]
})
export class AdminPage {
    
    modalCtrl = inject(ModalController);
    
    constructor() {
        addIcons({ addOutline });
    }

    async addTournament($event: PointerEvent) {
        const modal = await this.modalCtrl.create({
            component: TournamentForm, componentProps: {
                tournament: null 
            }
        });
        modal.present();
        
        const { data, role } = await modal.onWillDismiss();
        console.log('Modal dismissed with data:', data, 'and role:', role);

    }
}