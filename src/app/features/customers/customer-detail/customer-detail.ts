import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { TitleService } from '../../../core/services/title.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrudMode } from '../../../shared/enums/crud.enum';

@Component({
  selector: 'app-customer-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.css',
})
export class CustomerDetail implements OnInit {
  crudMode: CrudMode = CrudMode.READ;

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
    // this.setHeaderValues();
    // this.getCustomerDetails();
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
      this.detailsForm.patchValue(res);

      if (this.crudMode === CrudMode.READ) {
        this.detailsForm.disable();
      } else {
        this.detailsForm.enable();
      }
    });
  }

  // getCustomerDetails() {
  //   const customerId = this.route.snapshot.paramMap.get('customerId') as string;

  //   this.customerService.getCustomer(customerId).subscribe((res) => {
  //     this.detailsForm.patchValue({
  //       firstName: res.firstName,
  //       lastName: res.lastName,
  //       email: res.email,
  //       company: res.company,
  //       phone: res.phone,
  //     });
  //   });
  // }

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
}
