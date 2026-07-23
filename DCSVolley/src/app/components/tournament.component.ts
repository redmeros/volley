import { Component, input} from "@angular/core";
import { Tournament } from "../apiModels/tournament";
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: "app-tournament",
  template: `
      <p>Tournament works!</p>
  `,
  imports: []
})
export class TournamentComponent {
    model = input<Tournament>()
    
    constructor() {
       console.warn("TODO tournament component not implemented yet"); 
    }
}