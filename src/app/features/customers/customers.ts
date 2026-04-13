import { Component, inject, OnInit, signal } from '@angular/core';

import { TitleService } from '../../core/services/title.service';
import { CustomerService } from '../../core/services/customer.service';

import { MatTableModule } from '@angular/material/table';
import { Customer } from '../../core/models/customer.model';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-customers',
  imports: [MatTableModule, MatIcon, MatButtonModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customerList = signal<Customer[]>([]);

  columnToDisplay = ['name', 'email', 'company', 'edit'];

  private titleService = inject(TitleService);
  private customerService = inject(CustomerService);

  ngOnInit(): void {
    this.titleService.setTitle('Customers');
    this.getCustomers();
  }

  getCustomers() {
    this.customerService.getCustomerList().subscribe((res) => this.customerList.set(res));
  }

  getFullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`;
  }
}
