import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class ConfigService {
    apiBase = "http://localhost:8080"
    apiUrl = this.apiBase + "/api" 
}