import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { setHeadersInterceptor } from './core/interceptors/set-headers.interceptor';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor-interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([setHeadersInterceptor, errorHandlerInterceptor])),
  ],
};
