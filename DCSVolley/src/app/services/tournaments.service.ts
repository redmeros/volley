import { inject, Injectable } from "@angular/core";
import { ConfigService } from "./config.service";
import { Observable, tap } from "rxjs";
import { Tournament } from "../apiModels/tournament";
import { HttpClient } from "@angular/common/http";

@Injectable({
providedIn: 'root'})
export class TournamentsService {

    private config = inject(ConfigService)
    private http = inject(HttpClient)
    
    getTournaments() : Observable<Tournament[]> {
        return this.http
            .get<Tournament[]>(this.config.apiUrl + "/tournaments/")
            .pipe(
                tap((tournaments) => {
                    console.log("Fetched tournaments:", tournaments);
                })
            );
    }
    
    createTournament(tournament: Tournament): Observable<Tournament> {
        return this.http.post<Tournament>(this.config.apiUrl + "/tournaments/", tournament);
    }

}