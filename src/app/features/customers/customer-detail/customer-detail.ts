import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { finalize, switchMap } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/auth/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { TitleService } from '../../../core/services/title.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

import { Customer } from '../../../core/models/user.model';

import { CrudMode } from '../../../shared/enums/crud.enum';
import { SnackbarMode } from '../../../shared/enums/snackbarMode.enum';
import { UserRole } from '../../../shared/enums/user-roles.enum';
import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input-field/input-field';
import { MessageService } from '../../../core/services/message.service';
import { Message } from '../../../core/models/message.model';
import { ManagerService } from '../../../core/services/manager.service';

@Component({
  selector: 'app-customer-detail',
  imports: [ReactiveFormsModule, MatIconModule, CommonModule, Button, InputField],
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
  private snackbarService = inject(SnackbarService);
  private authService = inject(AuthService);
  private managerService = inject(ManagerService);
  private messageService = inject(MessageService);

  detailsForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    company: ['', Validators.required],
    phone: [''],
  });

  ngOnInit(): void {
    this.isLoading.set(true);
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
      this.isLoading.set(false);
      return;
    }

    const customerId = this.route.snapshot.paramMap.get('customerId') as string;

    this.customerService
      .getCustomer(customerId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((res) => {
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
    if (this.selectedCustomer) {
      if (this.crudMode === CrudMode.EDIT) {
        this.router.navigate(['/', 'customers', this.selectedCustomer?.id]);
      }
    }
    if (this.crudMode === CrudMode.CREATE) {
      this.router.navigate(['/', 'customers']);
    }
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
      this.authService.registerUser(newCustomer, UserRole.CUSTOMER).subscribe((res) => {
        this.snackbarService.showSnackbar('Customer created succesfully!', SnackbarMode.SUCCESS);
        this.customerService.setIsCustomerListLoaded(false);

        const managers = this.managerService
          .getManagerList$()()
          .map((m) => m.id);

        const message: Partial<Message> = {
          message: `Customer ${newCustomer.firstName} ${newCustomer.lastName} has been created.`,
          recipients: [...managers, 'oTdsBHvmd8WyXkLndq9sJR433R33'],
        };

        this.messageService.createMessage(message);

        this.router.navigate(['/', 'customers']);
      });
    } else if (this.selectedCustomer) {
      const editedCustomer: Customer = {
        ...this.selectedCustomer,
        ...formValue,
      };

      this.customerService
        .updateCustomer(editedCustomer)
        .subscribe(
          (res) => (
            this.snackbarService.showSnackbar(
              'Customer updated succesfully!',
              SnackbarMode.SUCCESS,
            ),
            this.navigateToReadDetails()
          ),
        );
    }
  }

  deleteCustomer() {
    const role = UserRole.CUSTOMER;

    this.authService
      .deleteUser(
        this.selectedCustomer?.id as string,
        this.selectedCustomer?.email as string,
        this.selectedCustomer?.firstName as string,
        this.selectedCustomer?.lastName as string,
        role,
      )
      .subscribe(() => {
        this.snackbarService.showSnackbar('Customer deleted successfully!', SnackbarMode.SUCCESS);

        this.customerService.setIsCustomerListLoaded(false);

        const managers = this.managerService
          .getManagerList$()()
          .map((m) => m.id);

        const message: Partial<Message> = {
          message: `Customer ${this.selectedCustomer?.firstName} ${this.selectedCustomer?.lastName} has been deleted.`,
          recipients: [...managers, 'oTdsBHvmd8WyXkLndq9sJR433R33'],
        };

        this.messageService.createMessage(message);

        this.router.navigate(['/', 'customers']);
      });
  }
}
