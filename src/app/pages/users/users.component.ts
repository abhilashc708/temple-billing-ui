import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { debounceTime } from 'rxjs/operators';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule, ChangePasswordComponent, ConfirmDialogComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  successMessage: string = '';
    errorMessage: string = '';
  role: string = '';
   username: string = '';
   avatar: string = '';

   users: any[] = [];

   userForm!: FormGroup;

   showModal = false;
   isEditMode = false;
   selectedUserId: number | null = null;
   selectedUsername: string = '';
   profile: any = {};
   showMyProfileModal = false;

   showProfile = false;

 @ViewChild(ChangePasswordComponent)
 changePasswordPopup!: ChangePasswordComponent;

   page = 0;
   size = 5;
   totalPages = 0;

   constructor(
     private fb: FormBuilder,
     private usersService: UsersService,
     private router: Router
   ) {}

   activeMenu: string | null = null;

   toggleMenu(menu: string) {
     this.activeMenu = this.activeMenu === menu ? null : menu;
   }

   ngOnInit() {

     this.initializeForm();
     this.loadUsers();

     this.username = localStorage.getItem('name') || 'User';
     this.avatar = localStorage.getItem('avatar') || 'U';
     this.role = localStorage.getItem('role') || 'NULL';

   }

 getFirstName(username: string): string {
   if (!username) return '';
   const firstName = username.split(' ')[0];
   return firstName.charAt(0).toUpperCase() + firstName.slice(1);
 }

   initializeForm() {

     this.userForm = this.fb.group({

       username: ['', Validators.required],
       password: ['', Validators.required],
       name: ['', Validators.required],
       address: [''],
       email: [''],
       phone: [''],
       role: ['USER', Validators.required]

     });

   }

   loadUsers() {

     this.usersService.getUsers(this.page, this.size)
       .subscribe((res: any) => {

         this.users = res.content;
         this.totalPages = res.totalPages;

       });

   }

//    openModal() {
//
//      this.showModal = true;
//      this.isEditMode = false;
//      this.selectedUserId = null;
//
//      this.userForm.reset({
//        role: 'USER'
//      });
//
//    }
openModal() {

  this.showModal = true;
  this.isEditMode = false;
  this.selectedUserId = null;

  this.userForm.reset({
    username: '',
    password: '',
    name: '',
    address: '',
    email: '',
    phone: '',
    role: 'USER'
  });

  // Restore password validation
  this.userForm.get('password')?.setValidators([Validators.required]);
  this.userForm.get('password')?.updateValueAndValidity();

}
   closeModal() {
     this.showModal = false;
   }

editUser(user: any) {

  this.showModal = true;
  this.isEditMode = true;
  this.selectedUserId = user.id;

  // Remove password validation in edit mode
  this.userForm.get('password')?.clearValidators();
  this.userForm.get('password')?.updateValueAndValidity();

  this.userForm.patchValue({
    username: user.username || '',
    name: user.name || '',
    address: user.address || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'USER'
  });

}

//    submitUser() {
//
//      if (this.userForm.invalid) {
//        this.userForm.markAllAsTouched();
//        return;
//      }
//
//      const formData = this.userForm.value;
//  console.log("Payload:", formData);
//      if (this.isEditMode && this.selectedUserId) {
//
//        this.usersService.updateUser(this.selectedUserId, formData)
//          .subscribe(() => {
//
//            alert('User Updated Successfully');
//            this.afterSave();
//
//          });
//
//      } else {
//
//        this.usersService.createUser(formData)
//          .subscribe(() => {
//
//            alert('User Created Successfully');
//            this.afterSave();
//
//          });
//
//      }
//
//    }

submitUser() {

  if (this.userForm.invalid) {
    this.userForm.markAllAsTouched();
    return;
  }

  const formData = this.userForm.value;

  if (this.isEditMode) {
    delete formData.password;
  }

  console.log("Payload:", formData);

  if (this.isEditMode && this.selectedUserId) {

    this.usersService.updateUser(this.selectedUserId, formData)
//       .subscribe(() => {
//         alert('User Updated Successfully');
//         this.afterSave();
//       });
.subscribe({
              next: () => {
          this.successMessage = 'User Updated Successfully';
          this.errorMessage = '';

          this.afterSave();
          this.autoHideMessage();

        },
        error: (err) => {

          this.errorMessage = err.error?.message || 'Update Failed';
          this.successMessage = '';

          this.autoHideMessage();

        }
        });

  } else {

    this.usersService.createUser(formData)
//       .subscribe(() => {
//         alert('User Created Successfully');
//         this.afterSave();
//       });
.subscribe({
       next: () => {

         this.successMessage = 'User Created Successfully';
         this.errorMessage = '';

         this.afterSave();
         this.autoHideMessage();

       },
       error: (err) => {

         this.errorMessage = err.error?.message || 'Create Failed';
         this.successMessage = '';

         this.autoHideMessage();

       }
     });


  }

}

autoHideMessage() {
  setTimeout(() => {
    this.successMessage = '';
    this.errorMessage = '';
  }, 3000);
}

//    deleteUser(id: number) {
//
//      if (!confirm('Are you sure you want to delete this user?')) {
//        return;
//      }
//
//      this.usersService.deleteUser(id)
//        .subscribe(() => {
//
//          alert('Deleted Successfully');
//          this.loadUsers();
//
//        });
//
//    }


// deleteUser(id: number, username: string) {
//
//   const loggedUser = localStorage.getItem('username');
//
//   if (loggedUser === username) {
//     alert("You cannot delete your own account!");
//     return;
//   }
//
//   if (!confirm('Are you sure you want to delete this user?')) {
//     return;
//   }
//
//   this.usersService.deleteUser(id)
//     .subscribe(() => {
//
//       alert('Deleted Successfully');
//       this.loadUsers();
//
//     });
//
// }


deleteConfirmed(){

  if(!this.selectedUserId) return;

  const loggedUser = localStorage.getItem('username');

  if(loggedUser === this.selectedUsername){
    this.errorMessage = "You cannot delete your own account!";
    this.autoHideMessage();
    return;
  }

  this.usersService.deleteUser(this.selectedUserId)
  .subscribe({

    next:()=>{

      this.successMessage = "User deleted successfully";
      this.loadUsers();
      this.autoHideMessage();

    },

    error:()=>{

      this.errorMessage = "Delete failed";
      this.autoHideMessage();

    }

  });

}
   afterSave() {

     this.closeModal();
     this.loadUsers();

   }

   changePage(newPage: number) {

     this.page = newPage;
     this.loadUsers();

   }

   isAdmin(): boolean {
     return this.role === 'ADMIN';
   }

 isUser(): boolean {
   return this.role === 'USER';
 }


   toggleProfile(event: Event) {
     event.stopPropagation();
     this.showProfile = !this.showProfile;
   }

   @HostListener('document:click')
   closeProfile() {
     this.showProfile = false;
   }

   logout() {

     localStorage.clear();
 this.router.navigate(['/login']);

   }

openMyProfile(){
  this.usersService.getMyProfile().subscribe(res => {
    this.profile = res;
    this.showMyProfileModal = true;

  });

}

}
