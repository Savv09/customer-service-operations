import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private router = inject(Router);

  activePage = signal<string>('customers');

  navigateToSelectedPage(selectedPage: string) {
    this.router.navigate(['/', selectedPage]);
    this.setActivePage(selectedPage);
  }

  setActivePage(newActivePage: string) {
    this.activePage.set(newActivePage);
  }
}
