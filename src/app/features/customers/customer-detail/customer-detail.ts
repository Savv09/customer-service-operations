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

  detailsForm = this.fb.group({
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

    const formValue = this.detailsForm.value;

    if (this.crudMode === CrudMode.CREATE) {
      return;
    } else {
      if (!!this.selectedCustomer) {
        const editedCustomer: Customer = {
          ...this.selectedCustomer,
          firstName: !!formValue.firstName ? formValue.firstName : '',
          lastName: !!formValue.lastName ? formValue.lastName : '',
          email: !!formValue.email ? formValue.email : '',
          company: !!formValue.company ? formValue.company : '',
          phone: !!formValue.phone ? formValue.phone : '',
        };
        this.customerService
          .updateCustomer(editedCustomer)
          .pipe(finalize(() => this.navigateToReadDetails()))
          .subscribe((res) => console.log(res));
      }
    }
  }
}
