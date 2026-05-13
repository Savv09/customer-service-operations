import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SnackbarService } from '../services/snackbar.service';
import { catchError, throwError } from 'rxjs';
import { SnackbarMode } from '../../shared/enums/snackbarMode.enum';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbarService = inject(SnackbarService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred. Please try again.';

      switch (error.status) {
        case 0:
          errorMessage = 'Network error. Please check your connection.';
          break;

        case 400:
          errorMessage = 'Invalid request. Please try again.';
          break;

        case 401:
          errorMessage = 'Session expired. Please sign in again';
          break;

        case 403:
          errorMessage = "You don't have permission to perform this action.";
          break;

        case 404:
          errorMessage = 'Requested resource not found.';
          break;

        case 500:
          errorMessage = 'Internal server error. Please try again later';
          break;
      }

      snackbarService.showSnackbar(errorMessage, SnackbarMode.ERROR);

      console.error(error);

      return throwError(() => error);
    }),
  );
};
