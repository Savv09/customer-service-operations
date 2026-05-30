import { Component, inject, OnInit } from '@angular/core';
import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private titleService = inject(TitleService);

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard');
  }
}
