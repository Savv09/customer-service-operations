import { inject, Pipe, PipeTransform } from '@angular/core';
import { CustomerService } from '../../core/services/customer.service';

@Pipe({
  name: 'customer',
})
export class CustomerPipe implements PipeTransform {
  private customerService = inject(CustomerService);

  transform(value: string): string {
    const customer = this.customerService
      .getCustomerList$()()
      .find((customer) => customer.id === value);

    return customer ? `${customer.firstName} ${customer.lastName}` : '';
  }
}
