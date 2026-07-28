import { Component, computed, inject, Input, input, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonContent, IonTitle, IonToolbar, IonHeader, IonList, IonItem, IonInput, IonLabel, IonDatetimeButton, IonModal, IonDatetime, IonButton, IonTextarea, IonButtons, IonFooter, ModalController } from "@ionic/angular/standalone";
import { Tournament } from "../apiModels/tournament";

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

<form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <ion-list>
                <ion-item [class.invalid]="formGroup.get('name')?.invalid && formGroup.get('name')?.touched"> 
                    <ion-label for="tournamentName" class="wide-label">Nazwa turnieju</ion-label>
                    <ion-input slot="end" id="tournamentName"  formControlName="name" placeholder="Wpisz nazwę turnieju"></ion-input>
                </ion-item>

                <div class="validation-errors">
                    @if (formGroup.get('name')?.invalid && formGroup.get('name')?.touched) {
                        <div class="error-message">Nazwa turnieju jest wymagana.</div>
                    }
                </div>

                <ion-item>
                    <ion-label for="startDate" class="wide-label">Data startu</ion-label>
                    <ion-input slot="end" id="startDate" class="wide-label" formControlName="start_date" placeholder="YYYY-MM-DD"></ion-input>
                </ion-item>
                
                <div class="validation-errors">
                    @if (formGroup.get('startDate')?.invalid && formGroup.get('startDate')?.touched) {
                        <div class="error-message">Data startu jest wymagana i musi być w formacie YYYY-MM-DD.</div>
                    }
                </div>

                <ion-item>
                    <ion-label for="endDate" class="wide-label">Data zakończenia</ion-label>
                    <ion-input slot="end" id="endDate" class="wide-label" formControlName="end_date" placeholder="YYYY-MM-DD"></ion-input>
                </ion-item>
                
                <div class="validation-errors">
                    @if (formGroup.get('endDate')?.invalid && formGroup.get('endDate')?.touched) {
                        <div class="error-message">Data zakończenia jest wymagana i musi być w formacie YYYY-MM-DD.</div>
                    }
                </div>
                
                <ion-item>
                    <ion-label for="description" class="wide-label">Opis turnieju</ion-label>
                    <ion-textarea slot="end" id="description" class="wide-label" formControlName="description" placeholder="Wpisz opis turnieju"></ion-textarea>
                </ion-item>
                
                <div class="validation-errors">
                    @if (formGroup.get('description')?.invalid && formGroup.get('description')?.touched) {
                        <div class="error-message">Opis turnieju jest wymagany.</div>
                    }
                </div>
            </ion-list> 
        </form>
    </ion-content>

    <ion-footer class="form-between">
        <ion-button (click)="onCancel()" color="warning" type="button">Anuluj</ion-button>
        <ion-button (click)="onSubmit()" color="success" type="button" [disabled]="formGroup.invalid">Zapisz</ion-button>
    </ion-footer>
    `,
    styles: [`
        ion-footer ion-button {
            min-width: 120px;
        }

        .form-between {
            justify-content: space-around;
            display: flex;
            align-items: center;
        }
        .wide-label 
        {
           font-style: italic;
           min-width: 160px;
        } 
        .validation-errors {
            padding-left: 16px;
            font-size: small;
            color: var(--ion-color-danger, #f1453d);
        }
        ion-item.invalid {
            --highlight-background: var(--ion-color-danger, #f1453d);
        }
        
        ion-item {
            --highlight-color-invalid: var(--ion-color-primary);
        }
        
        `],
    imports: [
        IonInput,
        IonContent, IonTitle, IonToolbar, IonHeader,
        ReactiveFormsModule, IonList, IonItem,
        IonButton, IonLabel, IonTextarea, IonFooter
    ]
})
export class TournamentForm implements OnInit {
    modalCtrl = inject(ModalController);
    tournament = input<Tournament | null>();
    isNew = computed(() => this.tournament === null);

    formGroup = new FormGroup({
        id: new FormControl(''),
        name: new FormControl('nazwa testowa', [Validators.required]),
        description: new FormControl('testowy opis'),
        start_date: new FormControl('2024-01-01', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
        end_date: new FormControl('2024-01-02', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
    });

    ngOnInit(): void {

        console.log('TournamentForm initialized with tournament:', this.tournament);
        if (!this.tournament) {
            return;
        }
        const t = this.tournament();
        if (!t) {
            return;
        }
        this.formGroup.patchValue({
            id: `${t.id}`, 
            name: t.name ?? '', 
            description: t.description ?? '',
            start_date: t.start_date ?? '',
            end_date: t.end_date ?? ''
        });
    }


    onSubmit() {
        let tournament;
        if (this.tournament) {
            tournament = this.tournament();
        }
        if (this.isNew() || !tournament || tournament == null) {
            tournament = {} as Tournament;
            tournament.id = -1;
        } 

        Object.assign(tournament, this.formGroup.value);
        
        this.modalCtrl.dismiss(tournament, 'submit');

    }
    onCancel() {
        this.modalCtrl.dismiss(null, 'cancel');
    }

}

