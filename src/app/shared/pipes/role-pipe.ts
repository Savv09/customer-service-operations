import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
})
export class RolePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (value === 0) {
      return 'Administrator';
    }
    return null;
  }
}
