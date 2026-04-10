import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.scss',
})
export class UpdateProfileComponent {
  form!: FormGroup;
  showModal = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [''],
      email: [''],
      phone: [''],
      address: [''],
      district: [''],
      state: [''],
    });
  }

  open() {
    this.usersService.getMyProfile().subscribe((res) => {
      this.form.patchValue(res);
      this.showModal = true;
    });
  }

  close() {
    this.showModal = false;
  }

  updateProfile() {
    const payload = this.form.value;

    this.usersService.updateMyProfile(payload).subscribe(() => {
      alert('Profile Updated Successfully');
      this.close();
    });
  }
}
