import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.css',
})
export class InputField {
  label = input.required<string>();
  placeholder = input('');
  type = input('text');

  required = input(true);
  hasStar = input(false);
  disabled = input(false);

  control = input.required<AbstractControl>();

  externalError = input(false);

  hasError = computed(
    () => (this.control().touched && this.control().invalid) || this.externalError(),
  );
}
