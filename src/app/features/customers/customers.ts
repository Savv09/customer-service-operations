import { Component, inject, OnInit } from '@angular/core';

import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-customers',
  imports: [],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  private titleService = inject(TitleService);

  ngOnInit(): void {
    this.titleService.setTitle('Customers');
  }
}
