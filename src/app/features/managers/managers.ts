import { Component, computed, inject, signal } from '@angular/core';

import { TitleService } from '../../core/services/title.service';
import { Manager } from '../../core/models/user.model';
import { ManagerService } from '../../core/services/manager.service';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { TableEvent } from '../../core/models/table-event.model';
import { Table } from '../../shared/components/table/table';
import { Button } from '../../shared/components/button/button';

@Component({
  selector: 'app-managers',
  imports: [MatTableModule, MatIcon, MatButtonModule, CommonModule, ScrollingModule, Table, Button],
  templateUrl: './managers.html',
  styleUrl: './managers.css',
})
export class Managers {
  filter = signal<string>('');
  filteredData = computed(() => {
    const filter = this.filter().trim().toLowerCase();

    if (!filter) return this.managerList();

    return this.managerList().filter(
      (manager) =>
        manager.firstName.toLowerCase().includes(filter) ||
        manager.lastName.toLowerCase().includes(filter),
    );
  });

  columnToDisplay = ['name', 'email', 'department'];

  private titleService = inject(TitleService);
  private managerService = inject(ManagerService);
  private router = inject(Router);

  managerList = this.managerService.getManagerList$();
  isManagerListLoaded = this.managerService.getIsManagerListLoaded();

  ngOnInit(): void {
    this.titleService.setTitle('Managers');
    this.titleService.setHasBackButton(false);
    this.getManagers();
  }

  getManagers() {
    if (!this.isManagerListLoaded()) {
      this.managerService
        .getManagerList()
        .subscribe((res) => this.managerService.updateManagerList$(res));
    }
  }

  getFullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`;
  }

  navigateToDetails(manager: TableEvent) {
    this.router.navigate(['/', 'managers', manager.id]);
  }

  navigateToEditManager(manager: Manager) {
    this.router.navigate(['/', 'managers', manager.id, 'edit']);
  }

  navigateToCreateManager() {
    this.router.navigate(['/', 'managers', 'new']);
  }

  searchManagers(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.filter.set(searchValue);
  }
}
