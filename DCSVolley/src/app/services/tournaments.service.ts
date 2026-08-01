import { inject, Injectable, InjectionToken } from "@angular/core";
import { ConfigService } from "./config.service";
import { firstValueFrom, Observable, tap } from "rxjs";
import { Tournament } from "../apiModels/tournament";
import { HttpClient } from "@angular/common/http";

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { removeEntity, upsertEntities, upsertEntity, withEntities } from '@ngrx/signals/entities';

@Injectable({
providedIn: 'root'})
export class TournamentsService {
    updateTournament(updatedTournament: Tournament): Observable<Tournament> {
        return this.http.put<Tournament>(this.config.apiUrl + `/tournaments/${updatedTournament.id}`, updatedTournament);
    }


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
    
    deleteTournament(id: number): Observable<void> {
        return this.http.delete<void>(this.config.apiUrl + `/tournaments/${id}`);
    }
    
    getTournament(id: number): Observable<Tournament> {
        return this.http.get<Tournament>(this.config.apiUrl + `/tournaments/${id}`);
    }
    
    getTournamentAsync(id: number): Promise<Tournament | undefined> {
        return firstValueFrom(this.getTournament(id))
    }
}


type AdminTournamentsState = {
    isLoading: boolean;
}

const initialAdminTournamentState: AdminTournamentsState = {
    isLoading: false,
}

export const AdminTournamentsStore = signalStore(
    {
        providedIn: 'root',
    },
    withState(initialAdminTournamentState),
    withEntities<Tournament>(),
    withMethods((store, tournamentService = inject(TournamentsService)) => ({

        async loadTournament(id: number) {
            patchState(store, { isLoading: true });
            const tournament = await tournamentService.getTournamentAsync(id);
            if (!tournament) {
                patchState(store, { isLoading: false });
                return;
            }
            patchState(store, { isLoading: false } ,upsertEntity(tournament));
            return tournament;
        },
        
        async loadTournaments() {
            patchState(store, { isLoading: true });
            const tournaments = await firstValueFrom(tournamentService.getTournaments());
            patchState(store, { isLoading: false }, upsertEntities(tournaments));
        },
        
        async removeTournament(id: number) {
            patchState(store, { isLoading: true });
            await firstValueFrom(tournamentService.deleteTournament(id));
            patchState(store, { isLoading: false }, removeEntity(id));
        },
        
        async createTournament(tournament: Tournament) {
            patchState(store, { isLoading: true });
            const createdTournament = await firstValueFrom(tournamentService.createTournament(tournament));
            patchState(store, { isLoading: false }, upsertEntity(createdTournament));
            return createdTournament;
        },

        async updateTournament(tournament: Tournament) {
            patchState(store, { isLoading: true });
            const updatedTournament = await firstValueFrom(tournamentService.updateTournament(tournament));
            patchState(store, { isLoading: false }, upsertEntity(updatedTournament));
            return updatedTournament;
        }

    }))
);

