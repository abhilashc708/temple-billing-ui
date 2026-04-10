import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  show = false;
  message = '';
  title = 'Confirm';

  @Output() confirmed = new EventEmitter<void>();

  open(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.show = true;
  }

  cancel() {
    this.show = false;
  }

  confirm() {
    this.confirmed.emit();
    this.show = false;
  }
}
