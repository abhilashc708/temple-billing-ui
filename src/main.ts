import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appRouter } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth-interceptor.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';


bootstrapApplication(AppComponent, {
    providers: [appRouter,
      provideHttpClient(withInterceptors([authInterceptor])),
      provideAnimationsAsync(),
      importProvidersFrom(MatDialogModule)
      ]
}).catch(err => console.error(err));
