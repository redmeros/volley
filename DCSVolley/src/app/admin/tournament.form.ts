import { Component, computed, Input, input, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonContent, IonTitle, IonToolbar, IonHeader, IonList, IonItem, IonInput, IonLabel, IonDatetimeButton, IonModal, IonDatetime } from "@ionic/angular/standalone";

@Component({
    selector: 'app-tournament-form',
    template: `
<ion-header>
    <ion-toolbar>
        @if (isNew()) {
            <ion-title>Twórz turniej</ion-title>
        } @else {
            <ion-title>Edytuj turniej</ion-title>
        }
    </ion-toolbar>
</ion-header>
<ion-content>
    <form [formGroup]="formGroup">
        <ion-list>
            <ion-item>
                <ion-input label="Nazwa turnieju" class="wide-label" formControlName="name" placeholder="Wpisz nazwę turnieju"></ion-input>
            </ion-item>
            <ion-item>
                <ion-datetime-button label="Data rozpoczęcia" class="wide-label" formControlName="startDate" placeholder="Wybierz datę rozpoczęcia"></ion-datetime-button>
                <ion-modal [keepContentsMounted]="true">
                    <ng-template>
                        <ion-datetime>
                        </ion-datetime>
                    </ng-template>
                </ion-modal>
            </ion-item>
        </ion-list> 
    </form>
</ion-content>
    `,
    styles: [`
        .wide-label label .label-text
        {
           font-style: italic;
        } 
        `],
    imports: [IonInput, IonContent, IonTitle, IonToolbar, IonHeader, ReactiveFormsModule, IonList, IonItem, IonDatetimeButton, IonModal, IonDatetime]
})
export class TournamentForm implements OnInit {
    tournament = input()
    isNew = computed(() => this.tournament === null);

    formGroup = new FormGroup({
        id: new FormControl(''),
        name: new FormControl('', [Validators.required]),
        description: new FormControl(''),
        startDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
    });

    ngOnInit(): void {
        console.log('TournamentForm initialized with tournament:', this.tournament);
    }

}