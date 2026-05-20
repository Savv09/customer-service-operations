import { Component, inject } from '@angular/core';

import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-managers',
  imports: [],
  templateUrl: './managers.html',
  styleUrl: './managers.css',
})
export class Managers {
  private titleService = inject(TitleService);

  ngOnInit(): void {
    this.titleService.setTitle('Managers');
  }
}
