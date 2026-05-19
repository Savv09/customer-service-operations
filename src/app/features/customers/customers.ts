import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TitleService } from '../../core/services/title.service';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/user.model';

@Component({
  selector: 'app-customers',
  imports: [MatTableModule, MatIcon, MatButtonModule, CommonModule, ScrollingModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customerList = signal<Customer[]>([]);

  filter = signal<string>('');
  filteredData = computed(() => {
    const filter = this.filter().trim().toLowerCase();

    if (!filter) return this.customerList();

    return this.customerList().filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(filter) ||
        customer.lastName.toLowerCase().includes(filter),
    );
  });

  columnToDisplay = ['name', 'email', 'company', 'edit'];

  private titleService = inject(TitleService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  ngOnInit(): void {
    this.titleService.setTitle('Customers');
    this.titleService.setHasBackButton(false);
    this.getCustomers();
  }

  getCustomers() {
    this.customerService.getCustomerList();
    this.customerList = this.customerService.getCustomerList$();
  }

  getFullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`;
  }

  navigateToDetails(customer: Customer) {
    this.router.navigate(['/', 'customers', customer.id]);
  }

  navigateToEditCustomer(customer: Customer) {
    this.router.navigate(['/', 'customers', customer.id, 'edit']);
  }

  navigateToCreateCustomer() {
    this.router.navigate(['/', 'customers', 'new']);
  }

  searchCustomers(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.filter.set(searchValue);
  }
}
