import { AfterViewInit, Component, effect, inject, input, OnDestroy, OnInit } from "@angular/core";
import { Tournament } from "../../apiModels/tournament";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdminTournamentsStore, TournamentsService } from "../../services/tournaments.service";
import { Subject } from "rxjs";
import { IonList, IonItem, IonLabel, IonInput, IonButton, IonText, IonTextarea, LoadingController } from "@ionic/angular/standalone";
import { MessageService } from "../../services/message.service";

@Component({
    selector: 'app-tournament-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.scss'],
    imports: [
        IonTextarea,
        IonInput,
        ReactiveFormsModule,
        IonButton
    ]
})
export class GeneralSettingsComponent implements OnDestroy {

    tournament = input<Tournament>();
    // tournamentService = inject(TournamentsService);
    tStore = inject(AdminTournamentsStore);
    // loadingCtrl = inject(LoadingController);
    messagesService = inject(MessageService);

    $destroy = new Subject<void>();

    form = new FormGroup({
        name: new FormControl(this.tournament()?.name, [Validators.required, Validators.minLength(3)]),
        description: new FormControl(this.tournament()?.description, []),
        start_date: new FormControl(this.tournament()?.start_date, [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]),
        end_date: new FormControl(this.tournament()?.end_date, [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)])
    });

    constructor() {
        effect(() => {
            const t = this.tournament();
            if (t && t.start_date && t.end_date) {
                try {

                    this.form.patchValue({
                        name: t.name,
                        description: t.description,
                        start_date: t.start_date,
                        end_date: t.end_date
                    });

                    const ds = new Date(t.start_date);
                    this.form.patchValue({
                        start_date: ds.toISOString().split('T')[0]
                    });

                    const de = new Date(t.end_date);
                    this.form.patchValue({
                        end_date: de.toISOString().split('T')[0]
                    });
                } catch (error) {
                    console.error('Error patching form values:', error);
                }

            }
        });
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }

    async onSubmit($event: Event) {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.messagesService.newMessage("Formularz zawiera błędy. Popraw je i spróbuj ponownie.", "danger", 3000);
            return;
        }

        // const loading = await this.loadingCtrl.create({
        //     message: "Zapisywanie zmian...",
        //     spinner: "crescent"
        // });
        // await loading.present();

        const formData = this.form.getRawValue();
        const tournament = this.tournament();
        if (!tournament) {
            this.messagesService.newMessage("Nie można zapisać zmian. Brak danych turnieju.", "danger", 3000);
            // await loading.dismiss();
            return;
        }

        const updatedTournament: Tournament = {
            ...tournament,
            name: formData.name || "",
            description: formData.description || "",
            start_date: formData.start_date || "",
            end_date: formData.end_date || ""
        };
        try {
            await this.tStore.updateTournament(updatedTournament);
        } catch (error) {
            console.error('Error updating tournament:', error);
            this.messagesService.newMessage("Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie.", "danger", 3000);
            return;
        }

        // this.tournamentService.updateTournament(updatedTournament).subscribe({
        //     next: (updated) => {
        //         this.tournament()!.created_at = updated.created_at;
        //         this.tournament()!.created_by = updated.created_by;
        //         this.tournament()!.name = updated.name;
        //         this.tournament()!.description = updated.description;
        //         this.tournament()!.start_date = updated.start_date;
        //         this.tournament()!.end_date = updated.end_date;

        //         this.messagesService.newMessage("Zmiany zostały zapisane.", "success", 2000);
        //     },
        //     error: (err) => {
        //         console.error("Błąd podczas zapisywania zmian:", err);
        //         this.messagesService.newMessage("Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie.", "danger", 3000);
        //         loading.dismiss();
        //     },
        //     complete: () => {
        //         loading.dismiss();
        //     }
        // })
    }
}