import { Component, input } from "@angular/core";
import { Tournament } from "../../apiModels/tournament";

@Component({
    selector: 'app-tournament-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent {
    tournament = input<Tournament>();
}