import { Component, effect, inject, OnDestroy, OnInit, signal, Signal } from "@angular/core";
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFab, IonIcon, IonFabButton, IonButton, ModalController, IonList, IonItem, IonCardSubtitle, LoadingController } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { addOutline } from "ionicons/icons";
import { TournamentForm } from "./tournament.form";
import { AdminTournamentsStore, TournamentsService } from "../services/tournaments.service";
import { MessageService } from "../services/message.service";
import { Tournament } from "../apiModels/tournament";
import { TournamentComponent } from "../components/tournament.component";
import { first, Subject, takeUntil } from "rxjs";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";

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


    modalCtrl = inject(ModalController);
    messageService = inject(MessageService);
    router = inject(Router);
    tStore = inject(AdminTournamentsStore);
    loadingCtrl = inject(LoadingController);
    availableTournaments: Signal<Tournament[] | null> = signal(null);

    destroy$ = new Subject<void>();
    
    

    constructor() {
        addIcons({ addOutline });
        
        effect(async () => {
            const loading = this.tStore.isLoading();
            if (loading) {
                const ctrl = await this.loadingCtrl.create({
                    message: 'Loading...',
                });
                await ctrl.present();
            } 
        });
        
        effect(async () => {
            const loading = this.tStore.isLoading();
            if (!loading) {
                await this.loadingCtrl.dismiss();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit(): void {
        this.updateTournaments();
    }

    editTournament(tournament: Tournament, $event: PointerEvent) {
        this.router.navigate(['/admin/tournament', tournament.id]);
    }

    async updateTournaments() {
        await this.tStore.loadTournaments();
        this.availableTournaments = this.tStore.entities;
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
        
        try {
            await this.tStore.removeTournament(tournament.id);
            this.messageService.newMessage(`Tournament "${tournament.name}" deleted successfully`, "success", 2000);
        } catch (error) {
            this.messageService.newMessage(`Failed to delete tournament "${tournament.name}"`, "danger", 2000);
            console.error('Failed to delete tournament:', error);
        }
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
        
        try {
            const createdTournament = await this.tStore.createTournament(data);
            this.messageService.newMessage(`Tournament "${createdTournament.name}" created successfully`, "success", 2000);
        } catch (error) {
            this.messageService.newMessage(`Failed to create tournament "${data.name}"`, "danger", 2000);
            console.error('Failed to create tournament:', error);
        }
    }
}