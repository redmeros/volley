import { Component, OnInit, signal, inject } from "@angular/core";
import { Tournament } from "../apiModels/tournament";
import { TournamentsService } from "../services/tournaments.service";
import { MessageService } from "../services/message.service";

@Component({
  selector: "app-tournaments",
  templateUrl: "./tournaments.page.html",
  styleUrls: ["./tournaments.page.scss"],
})
export class TournamentsPage implements OnInit {
    
    tournaments = signal<Tournament[]>([]);
    tournamentsService = inject(TournamentsService);
    messages = inject(MessageService);

    ngOnInit(): void {
        this.tournamentsService.getTournaments().subscribe({
            next: (tournaments) => {
                this.tournaments.set(tournaments);
            },
            error: (err) => {
                this.messages.newMessage("Failed to fetch tournaments", "danger",2000);
                console.error("Failed to fetch tournaments:", err);
            }
        });
    }

}