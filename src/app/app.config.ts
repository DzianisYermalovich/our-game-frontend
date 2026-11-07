import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MEDIA_STORAGE } from './_services/media/media-storage';
import { IdbMediaStorage } from './_services/media/idb-media-storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: MEDIA_STORAGE, useClass: IdbMediaStorage },
  ],
};
