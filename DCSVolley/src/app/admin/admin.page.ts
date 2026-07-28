import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFab, IonIcon, IonFabButton, IonButton, ModalController } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { addOutline } from "ionicons/icons";
import { TournamentForm } from "./tournament.form";
import { TournamentsService} from "../services/tournaments.service";
import { MessageService } from "../services/message.service";
import { Tournament } from "../apiModels/tournament";
import { TournamentComponent } from "../components/tournament.component";

@Component({
    selector: 'app-admin',
    templateUrl: './admin.page.html',
    imports: [IonIcon, IonCardContent, IonCardTitle, IonCardHeader, IonContent, IonCard, IonButton, TournamentComponent],
    styles: [`
        div.title {
            display: flex;
            justify-content: space-between;
        }`]
})
export class AdminPage implements OnInit {
    
    modalCtrl = inject(ModalController);
    tService = inject(TournamentsService);
    messageService = inject(MessageService);
    
    availableTournaments: WritableSignal<Tournament[] | null> = signal(null);
    
    constructor() {
        addIcons({ addOutline });
    }

    ngOnInit(): void {
        this.tService.getTournaments().subscribe({
            next: (tournaments) => {
                this.availableTournaments.set(tournaments);
            },
            error: (err) => {
                this.messageService.newMessage("Failed to fetch tournaments", "danger", 2000);
                console.error("Failed to fetch tournaments:", err);
            }
        });
    }

    async addTournament($event: PointerEvent) {
        const modal = await this.modalCtrl.create({
            component: TournamentForm, componentProps: {
                tournament: null 
            }
        });
        modal.present();
        
        const { data, role } = await modal.onWillDismiss();
        if (role !== 'submit') {
            console.log('Modal dismissed without submission');
            return;
        }
        
        this.tService.createTournament(data).subscribe({
            next: (tournament) => {
                console.log('Tournament created successfully:', tournament);
            },
            error: (err) => {
                this.messageService.newMessage(`Failed to create tournament ${err.error.error}`, "danger", 2000);
                console.error('Failed to create tournament:', err);
            }
        });
        
        console.log('Modal submitted with data:', data);

    }
}