import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { GodsService } from '../../services/gods.service';
import { RouterModule, Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-god',
  standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent, ConfirmDialogComponent],
  templateUrl: './god.component.html',
  styleUrl: './god.component.scss'
})
export class GodComponent {
  successMessage: string = '';
    errorMessage: string = '';
  role: string = '';
    username: string = '';
    avatar: string = '';
  gods: any[] = [];
  godForm!: FormGroup;
 showProfile = false;
  showModal = false;
  isEditMode = false;
  selectedGodId: number | null = null;
   profile: any = {};
       showMyProfileModal = false;

@ViewChild(UpdateProfileComponent)
  updateProfilePopup!: UpdateProfileComponent;

 @ViewChild(ChangePasswordComponent)
 changePasswordPopup!: ChangePasswordComponent;

  page = 0;
  size = 5;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private fb: FormBuilder,
    private godsService: GodsService,
    private usersService: UsersService,
    private router: Router
  ) {}

activeMenu: string | null = null;
toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  ngOnInit() {
    this.initializeForm();
    this.loadGods();
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
    this.godForm = this.fb.group({
      god: ['', Validators.required]
    });
  }

  loadGods() {
    this.godsService.getGods(this.page, this.size, 'createdDate')
      .subscribe((res: any) => {
        this.gods = res.content;
        this.totalPages = res.totalPages;
      });
  }

  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.selectedGodId = null;
    this.godForm.reset();
  }

  closeModal() {
    this.showModal = false;
  }

  editGod(god: any) {
    this.showModal = true;
    this.isEditMode = true;
    this.selectedGodId = god.id;

    this.godForm.patchValue({
      god: god.god
    });
  }

  submitGod() {

    if (this.godForm.invalid) {
      this.godForm.markAllAsTouched();
      return;
    }

    const formData = this.godForm.value;

    if (this.isEditMode && this.selectedGodId) {

      this.godsService.updateGod(this.selectedGodId, formData)
       .subscribe({
              next: () => {
//           alert('God Updated Successfully');
//           this.afterSave();

          this.successMessage = 'God Updated Successfully';
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

      this.godsService.createGod(formData)
//         .subscribe(() => {
//           alert('God Added Successfully');
//           this.afterSave();
//         });
 .subscribe({
        next: () => {

          this.successMessage = 'God Created Successfully';
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

//   deleteGod(id: number) {
//
//     if (!confirm('Are you sure you want to delete this god?')) {
//       return;
//     }
//
//     this.godsService.deleteGod(id)
//       .subscribe(() => {
//         alert('Deleted Successfully');
//         this.loadGods();
//       });
//   }

deleteConfirmed(){

  if(!this.selectedGodId) return;

  this.godsService.deleteGod(this.selectedGodId)
  .subscribe({

    next:()=>{

      this.successMessage = "God deleted successfully";
      this.loadGods();

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
    this.loadGods();
  }

onSearch() {
    this.page = 0; // reset page
    this.loadGods();
  }
changePage(newPage: number) {
    this.page = newPage;
    this.loadGods();
  }
isAdmin(): boolean {
  return this.role === 'ADMIN';
}

isUser(): boolean {
  return this.role === 'USER';
}

//----AVATAR PROFILE -----

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

@HostListener('document:click')
closeOutsideProfile() {
  this.showProfile = false;
}
openMyProfile(){
  this.usersService.getMyProfile().subscribe(res => {
    this.profile = res;
    this.showMyProfileModal = true;

  });
}
}
