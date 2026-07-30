import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from "@angular/core";
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFab, IonIcon, IonFabButton, IonButton, ModalController, IonList, IonItem, IonCardSubtitle } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { addOutline } from "ionicons/icons";
import { TournamentForm } from "./tournament.form";
import { TournamentsService} from "../services/tournaments.service";
import { MessageService } from "../services/message.service";
import { Tournament } from "../apiModels/tournament";
import { TournamentComponent } from "../components/tournament.component";
import { first, Subject, takeUntil } from "rxjs";
import { DatePipe } from "@angular/common";

@Component({
    selector: 'app-admin',
    templateUrl: './admin.page.html',
    imports: [IonIcon,
    IonCardContent, IonCardTitle, IonCardHeader, IonContent, IonCard, IonButton, IonCardSubtitle, DatePipe],
    styles: [`
        div.tournament-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .tournament-card {
            flex: 1 0 21%;
            max-width: 21%;
            min-width: 200px;
        }
        .tournament-card-buttons {
            display: flex;
            justify-content: space-between;
        }
        `]
})
export class AdminPage implements OnInit, OnDestroy {

    editTournament(tournament: Tournament, $event: PointerEvent) {
        throw new Error('Method not implemented.');
    }
    
    modalCtrl = inject(ModalController);
    tService = inject(TournamentsService);
    messageService = inject(MessageService);
    
    availableTournaments: WritableSignal<Tournament[] | null> = signal(null);
    
    destroy$ = new Subject<void>();
    
    constructor() {
        addIcons({ addOutline });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit(): void {
        this.updateTournaments();
    }
    
    updateTournaments() {
        this.tService.getTournaments()
            .pipe(
                first(),
                takeUntil(this.destroy$)
            )
            .subscribe({
            next: (tournaments) => {
                this.availableTournaments.set(tournaments);
            },
            error: (err) => {
                this.messageService.newMessage("Failed to fetch tournaments", "danger", 2000);
                console.error("Failed to fetch tournaments:", err);
            }
        });
    }
    
    async removeTournament(tournament: Tournament, $event: PointerEvent) {
        $event.stopPropagation();
        const confirmed = await this.messageService.confirm({
            message: `Jesteś pewny że chcesz usunąć ten turniej? "${tournament.name}", \n pamiętaj że ta operacja jest nieodwracalna?`,
            acceptBtnColor: "danger",
            acceptBtnTxt: "Tak, usuń",
            declineBtnColor: "primary",
            declineBtnTxt: "Nie, anuluj"
        });
        if (!confirmed) {
            return;
        }
        
        this.tService.deleteTournament(tournament.id).subscribe({
            next: () => {
                this.messageService.newMessage(`Tournament "${tournament.name}" deleted successfully`, "success", 2000);
                this.updateTournaments();
            },
            error: (err) => {
                this.messageService.newMessage(`Failed to delete tournament "${tournament.name}": ${err.error.error}`, "danger", 2000);
                console.error('Failed to delete tournament:', err);
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
                this.updateTournaments();
            },
            error: (err) => {
                this.messageService.newMessage(`Failed to create tournament ${err.error.error}`, "danger", 2000);
                console.error('Failed to create tournament:', err);
            }
        });
        
        console.log('Modal submitted with data:', data);

    }
}