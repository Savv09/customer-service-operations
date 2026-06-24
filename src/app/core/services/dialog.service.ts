import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(MatDialog);

  confirmOperation(title: string, message: string, confirmText = 'Yes', cancelText = 'No') {
    return this.dialog
      .open(ConfirmDialog, {
        data: {
          title,
          message,
          confirmText,
          cancelText,
        },
        panelClass: 'custom-dialog',
        position: {
          left: '40%',
        },
      })
      .afterClosed();
  }
}
