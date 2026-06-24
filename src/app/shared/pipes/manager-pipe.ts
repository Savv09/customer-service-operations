import { inject, Pipe, PipeTransform } from '@angular/core';
import { ManagerService } from '../../core/services/manager.service';

@Pipe({
  name: 'manager',
})
export class ManagerPipe implements PipeTransform {
  private managerService = inject(ManagerService);

  transform(value: string): string {
    const manager = this.managerService
      .getManagerList$()()
      .find((manager) => manager.id === value);

    return manager ? `${manager.firstName} ${manager.lastName}` : '';
  }
}
