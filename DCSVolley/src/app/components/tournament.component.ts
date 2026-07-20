import { Component, input} from "@angular/core";
import { Tournament } from "../apiModels/tournament";

@Component({
  selector: "app-tournament",
  template: `
    <p>Tournament works!</p>
  `
})
export class TournamentComponent {
    model = input<Tournament>()
    
    constructor() {
       console.warn("TODO tournament component not implemented yet"); 
    }
}