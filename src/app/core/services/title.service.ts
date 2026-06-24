import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private title = signal<string>('Customer Service Operation');
  private hasBackButton = signal<boolean>(false);
  private backButtonUrl = signal<string[]>([]);

  getTitle() {
    return this.title;
  }

  setTitle(newTitle: string) {
    this.title.set(newTitle);
  }

  getHasBackButton() {
    return this.hasBackButton;
  }

  setHasBackButton(newState: boolean) {
    this.hasBackButton.set(newState);
  }

  getBackButtonUrl() {
    return this.backButtonUrl;
  }

  setBackButtonUrl(url: string[]) {
    this.backButtonUrl.set(url);
  }
}
