import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

export type ButtonVariant = 'primary' | 'outline' | 'success' | 'danger';

export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'app-button',
  imports: [CommonModule, MatIcon],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  label = input.required<string>();
  icon = input<string>();

  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');

  disabled = input(false);

  buttonClicked = output<void>();

  onButtonClicked() {
    this.buttonClicked.emit();
  }
}
