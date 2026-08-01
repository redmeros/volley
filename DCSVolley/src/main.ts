import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors} from '@angular/common/http';
import { tokenInterceptor } from './app/services/token.interceptor';
import { AdminTournamentsStore } from './app/services/tournaments.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(withInterceptors([
      tokenInterceptor      
    ])),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    // {
    //   provide: AdminTournamentsStore,
    //   useValue: AdminTournamentsStore,
    // }

  ],
});



