import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  title = signal<string>('Customer Service Operation');

  setTitle(newTitle: string) {
    this.title.set(newTitle);
  }
}
