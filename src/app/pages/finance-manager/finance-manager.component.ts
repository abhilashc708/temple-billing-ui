import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinanceManagerService } from '../../services/finance-manager.service';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-finance-manager',
  standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent, ConfirmDialogComponent],
  templateUrl: './finance-manager.component.html',
  styleUrl: './finance-manager.component.scss'
})
export class FinanceManagerComponent {

  @ViewChild(UpdateProfileComponent)
    updateProfilePopup!: UpdateProfileComponent;

 @ViewChild(ChangePasswordComponent)
 changePasswordPopup!: ChangePasswordComponent;

successMessage: string = '';
  errorMessage: string = '';
  role: string = '';
 username: string = '';
  avatar: string = '';
  financeList: any[] = [];
  financeForm!: FormGroup;
   filterForm!: FormGroup;
showProfile = false;
  showModal = false;
  isEditMode = false;
  selectedId: number | null = null;
  profile: any = {};
       showMyProfileModal = false;

  page = 0;
  size = 5;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceManagerService,
     private usersService: UsersService
  ) {}

  ngOnInit() {
     this.initializeFilterForm();
    this.initializeForm();
    this.loadFinanceList();
     this.username = localStorage.getItem('name') || 'User';
     this.avatar = localStorage.getItem('avatar') || 'U';
     this.role = localStorage.getItem('role') || 'NULL';
  }
getFirstName(username: string): string {
  if (!username) return '';
  const firstName = username.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

activeMenu: string | null = null;
toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

initializeFilterForm() {
    this.filterForm = this.fb.group({
      title: ['']
    });
  }
  initializeForm() {
    this.financeForm = this.fb.group({
      title: ['', Validators.required],
      titleMalayalam: ['', Validators.required],
      transactionType: ['', Validators.required]
    });
  }

loadFinanceList() {
    const filters = this.filterForm.value;
    let queryParams: any = {};
    if (filters.title) {
      queryParams.title = filters.title;
    }

    const hasFilters = Object.keys(queryParams).length > 0;
     if (hasFilters) {
      this.financeService
      .searchFinance(queryParams, this.page, this.size)
      .subscribe({
        next: (res: any) => {
          this.financeList = res.content;
          this.totalPages = res.totalPages;
          this.totalElements = res.totalElements;
          this.page = res.number;
        },
        error: (err) => {
          console.error('Error loading offerings', err);
        }
      });
    }else{
      this.financeService
            .getAll(this.page, this.size, 'createdDate')
            .subscribe({
              next: (res: any) => {
                this.financeList = res.content;
                this.totalElements = res.totalElements;
                 this.totalPages = res.totalPages;   // ✅ important
                 this.page = res.number;             // ✅ current page
              },
              error: (err) => {
                console.error('Error loading offerings', err);
              }
            });

      }
  }


  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.selectedId = null;
    this.financeForm.reset();
  }

  closeModal() {
    this.showModal = false;
  }

  editFinance(item: any) {
    this.showModal = true;
    this.isEditMode = true;
    this.selectedId = item.id;

    this.financeForm.patchValue({
      title: item.title,
      titleMalayalam: item.titleMalayalam,
      transactionType: item.transactionType
    });
  }

  submitFinance() {

    if (this.financeForm.invalid) {
      this.financeForm.markAllAsTouched();
      return;
    }

    const data = this.financeForm.value;

    if (this.isEditMode && this.selectedId) {
      this.financeService.update(this.selectedId, data)
//         .subscribe(() => {
//           alert('Updated Successfully');
//           this.afterSave();
//         });
.subscribe({
              next: () => {
          this.successMessage = 'Finance Header Updated Successfully';
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
      this.financeService.create(data)
//         .subscribe(() => {
//           alert('Added Successfully');
//           this.afterSave();
//         });
.subscribe({
       next: () => {

         this.successMessage = 'Finance Header Created Successfully';
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

//   deleteFinance(id: number) {
//     if (!confirm('Are you sure you want to delete?')) return;
//
//     this.financeService.delete(id)
//       .subscribe(() => {
//         alert('Deleted Successfully');
//         this.loadFinanceList();
//       });
//   }

deleteConfirmed(){

  if(!this.selectedId) return;

  this.financeService.delete(this.selectedId)
  .subscribe({

    next:()=>{

      this.successMessage = "Finance Title deleted successfully";
      this.loadFinanceList();

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
    this.loadFinanceList();
  }

  changePage(newPage: number) {
    this.page = newPage;
    this.loadFinanceList();
  }
  onReset() {
    this.filterForm.reset();
    this.page = 0;
    this.loadFinanceList();
  }
 onSearch() {
    this.page = 0; // reset page
    this.loadFinanceList();
  }

autoTranslate() {
  this.financeForm.get('title')?.valueChanges
    .subscribe((value: string) => {
      if (!value) {
        this.financeForm.get('titleMalayalam')?.setValue('');
        return;
      }
      this.translateToMalayalam(value);
    });
}

translateToMalayalam(text: string) {

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ml&dt=t&q=${text}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      const translatedText = data[0][0][0];

      this.financeForm.get('titleMalayalam')
        ?.setValue(translatedText, { emitEvent: false });

    })
    .catch(err => console.error(err));
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
  window.location.href = '/login';
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
