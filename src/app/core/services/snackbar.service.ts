import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private snackbar = inject(MatSnackBar);

  showSnackbar(message: string, mode: 'success' | 'error' | 'info') {
    this.snackbar.open(message, 'Close', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [`snackbar-${mode}`],
    });
  }
}
