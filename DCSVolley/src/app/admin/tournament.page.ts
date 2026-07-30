import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";

@Component({
    selector: 'app-tournament',
    templateUrl: './tournament.page.html',
    styles: [``]
})
export class TournamentPage implements OnDestroy, OnInit {
    activatedRoute = inject(ActivatedRoute); 
    $destroy = new Subject<void>();

    ngOnInit(): void {
        this.activatedRoute.params.subscribe(params => {
            const tournamentId = params['id'];
            console.log('TournamentPage initialized with tournament ID:', tournamentId);
        });
    }

    ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
    }
}