import { Component, inject, signal } from '@angular/core';
import { CrudMode } from '../../../shared/enums/crud.enum';
import { Manager } from '../../../core/models/user.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagerService } from '../../../core/services/manager.service';
import { TitleService } from '../../../core/services/title.service';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AuthService } from '../../../core/auth/auth.service';
import { finalize } from 'rxjs';
import { SnackbarMode } from '../../../shared/enums/snackbarMode.enum';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { UserRole } from '../../../shared/enums/user-roles.enum';
import { RolePipe } from '../../../shared/pipes/role-pipe';

@Component({
  selector: 'app-manager-detail',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule, RolePipe],
  templateUrl: './manager-detail.html',
  styleUrl: './manager-detail.css',
})
export class ManagerDetail {
  isLoading = signal<boolean>(false);
  crudMode: CrudMode = CrudMode.READ;
  CrudMode = CrudMode;
  selectedManager: Manager | null = null;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private managerService = inject(ManagerService);
  private titleService = inject(TitleService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackbarService = inject(SnackbarService);
  private authService = inject(AuthService);

  detailsForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    department: ['', Validators.required],
    phone: [''],
  });

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.crudMode = data['mode'];
      this.initByMode();
    });
  }

  initByMode() {
    this.setHeaderValues();

    if (this.crudMode === CrudMode.CREATE) {
      this.detailsForm.reset();
      this.detailsForm.enable();
      return;
    }

    const managerId = this.route.snapshot.paramMap.get('managerId') as string;

    this.managerService.getManager(managerId).subscribe((res) => {
      this.selectedManager = res;
      this.detailsForm.patchValue(res);

      if (this.crudMode === CrudMode.READ) {
        this.detailsForm.disable();
      } else {
        this.detailsForm.enable();
      }
    });
  }

  setHeaderValues() {
    if (this.crudMode === CrudMode.CREATE) {
      this.titleService.setTitle('New Manager');
    } else if (this.crudMode === CrudMode.EDIT) {
      this.titleService.setTitle('Edit Manager');
    } else {
      this.titleService.setTitle('Manager Details');
    }

    this.titleService.setHasBackButton(true);
    this.titleService.setBackButtonUrl(['/', 'managers']);
  }

  navigateToEditManager(selectedManagerId: string) {
    this.router.navigate(['/', 'managers', selectedManagerId, 'edit']);
  }

  navigateToReadDetails() {
    if (this.selectedManager) {
      if (this.crudMode === CrudMode.EDIT) {
        this.router.navigate(['/', 'managers', this.selectedManager?.id]);
      }
    }
    if (this.crudMode === CrudMode.CREATE) {
      this.router.navigate(['/', 'managers']);
    }
  }

  saveManagerForm() {
    if (!this.detailsForm.valid) return;

    const formValue = this.detailsForm.getRawValue();

    if (this.crudMode === CrudMode.CREATE) {
      const activeUserId = localStorage.getItem('uId');

      const newManager: Partial<Manager> = {
        ...formValue,
        createdBy: activeUserId ?? '',
      };

      this.authService
        .registerUser(newManager, UserRole.MANAGER)
        .pipe(finalize(() => this.router.navigate(['/', 'managers'])))
        .subscribe((res) =>
          this.snackbarService.showSnackbar('Manager created succesfully!', SnackbarMode.SUCCESS),
        );
    } else if (this.selectedManager) {
      const editedManager: Manager = {
        ...this.selectedManager,
        ...formValue,
      };

      this.managerService
        .updateManager(editedManager)
        .pipe(finalize(() => this.navigateToReadDetails()))
        .subscribe((res) =>
          this.snackbarService.showSnackbar('Manager updated succesfully!', SnackbarMode.SUCCESS),
        );
    }
  }

  deleteManager() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete manager',
        message: 'Are you sure you want to delete this manager?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
      panelClass: 'custom-dialog',
      position: {
        left: '40%',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.selectedManager)
          this.managerService.deleteManager(this.selectedManager?.id).subscribe((res) => {
            this.snackbarService.showSnackbar('Manager deleted succesfully!', SnackbarMode.SUCCESS);
            this.router.navigate(['/', 'managers']);
          });
      }
    });
  }
}
