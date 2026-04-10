import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  successMessage: string = '';
  errorMessage: string = '';
  form!: FormGroup;
  showModal = false;
  username = localStorage.getItem('username');
  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  open() {
    this.showModal = true;
    this.form.reset();
  }

  close() {
    this.showModal = false;
  }

  changePassword() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match';
      this.autoHideMessage();
      return;
    }

    const payload = {
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword,
    };

    this.usersService.changePassword(payload).subscribe({
      next: () => {
        this.successMessage =
          'Password changed successfully. Please login again.';
        this.autoHideMessage();

        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000); // wait so user sees message
      },

      error: () => {
        this.errorMessage = 'Current password is incorrect';
        this.autoHideMessage();
      },
    });
  }
  autoHideMessage() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}
