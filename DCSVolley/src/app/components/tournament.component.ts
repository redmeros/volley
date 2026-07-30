import { Component, input} from "@angular/core";
import { Tournament } from "../apiModels/tournament";
import { IonContent } from "@ionic/angular/standalone";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-tournament",
  template: `
    <div class="tournament-card">
        <div class="tournament-info">
            <p class="title"><span class="muted small">{{ model()?.id }}</span> {{ model()?.name}}</p>
        </div>
       <div>
    {{ model()?.start_date | date:'yyyy-MM-dd' }} - {{ model()?.end_date | date:'yyyy-MM-dd' }}
</div> 
    </div>
  `,
  host: {
    'class.w-100': 'true',
  },
  styles: [`
    .w-100 {
        width: 100%;
    }
    .muted {
        color: #888;
        font-style: italic;
    }
    .small {
        font-size: 0.8em;
    }
    .title {
        font-weight: bold;
        font-size: 1.2em;
    }
    .tournament-card {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 16px;
        margin: 8px 0;
        background-color: #f9f9f9;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    `],
  imports: [
    DatePipe
  ]
})
export class TournamentComponent {
    model = input<Tournament>()
    
    constructor() {
       console.warn("TODO tournament component not implemented yet"); 
    }
}