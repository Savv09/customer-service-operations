import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { TitleService } from '../../../core/services/title.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrudMode } from '../../../shared/enums/crud.enum';
import { MatIconModule } from '@angular/material/icon';
import { Customer } from '../../../core/models/customer.model';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-customer-detail',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.css',
})
export class CustomerDetail implements OnInit {
  isLoading = signal<boolean>(false);
  crudMode: CrudMode = CrudMode.READ;
  CrudMode = CrudMode;
  selectedCustomer: Customer | null = null;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);
  private titleService = inject(TitleService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  detailsForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    company: ['', Validators.required],
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

    const customerId = this.route.snapshot.paramMap.get('customerId') as string;

    this.customerService.getCustomer(customerId).subscribe((res) => {
      this.selectedCustomer = res;
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
      this.titleService.setTitle('New Customer');
    } else if (this.crudMode === CrudMode.EDIT) {
      this.titleService.setTitle('Edit Customer');
    } else {
      this.titleService.setTitle('Customer Details');
    }

    this.titleService.setHasBackButton(true);
    this.titleService.setBackButtonUrl(['/', 'customers']);
  }

  navigateToEditCustomer(selectedCustomerId: string) {
    this.router.navigate(['/', 'customers', selectedCustomerId, 'edit']);
  }

  navigateToReadDetails() {
    this.router.navigate(['/', 'customers', this.selectedCustomer?.id]);
  }

  saveCustomerForm() {
    if (!this.detailsForm.valid) return;

    const formValue = this.detailsForm.getRawValue();

    if (this.crudMode === CrudMode.CREATE) {
      const activeUserId = localStorage.getItem('uId');

      const newCustomer: Partial<Customer> = {
        ...formValue,
        createdBy: activeUserId ?? '',
      };

      this.customerService
        .createCustomer(newCustomer)
        .pipe(finalize(() => this.router.navigate(['/', 'customers'])))
        .subscribe((res) => console.log(res));
    } else if (this.selectedCustomer) {
      const editedCustomer: Customer = {
        ...this.selectedCustomer,
        ...formValue,
      };

      this.customerService
        .updateCustomer(editedCustomer)
        .pipe(finalize(() => this.navigateToReadDetails()))
        .subscribe((res) => console.log(res));
    }
  }

  deleteCustomer() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete customer',
        message: 'Are you sure you want to delete this customer?',
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
        if (this.selectedCustomer)
          this.customerService
            .deleteCustomer(this.selectedCustomer?.id)
            .subscribe((res) => this.router.navigate(['/', 'customers']));
      }
    });
  }
}
