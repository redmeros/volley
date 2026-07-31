import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, switchMap, takeUntil } from "rxjs";
import { IonContent, IonAccordionGroup, IonAccordion, IonLabel, IonItem, IonIcon, IonCard, IonCardContent, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";
import { GeneralSettingsComponent } from "./general-settings/general-settings.component";
import { Tournament } from "../apiModels/tournament";
import { TournamentsService } from "../services/tournaments.service";

@Component({
    selector: 'app-tournament',
    templateUrl: './tournament.page.html',
    styles: [``],
    imports: [IonCol, IonRow, IonGrid, IonCardContent, IonCard, IonIcon, IonItem, IonLabel, IonContent, IonAccordionGroup, IonAccordion, GeneralSettingsComponent]
})
export class TournamentPage implements OnDestroy, OnInit {
    activatedRoute = inject(ActivatedRoute); 
    tournamentService = inject(TournamentsService);

    $destroy = new Subject<void>();
    
    tournament : WritableSignal<Tournament> = signal({
        id: 0,
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        created_by: '',
        created_at: ''
    });

    ngOnInit(): void {
        this.activatedRoute.params.pipe(
            takeUntil(this.$destroy),
            switchMap(params => {
                const id = params['id'];
                return this.tournamentService.getTournament(id).pipe(
                    takeUntil(this.$destroy)
                );
            })
        ).subscribe(tournament => {
            this.tournament.set(tournament);
        });
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
}