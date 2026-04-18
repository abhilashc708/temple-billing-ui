import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OfferingService } from '../../services/offering.service';
import { GodsService } from '../../services/gods.service';
import { Offering } from '../../models/offering.model';
import { debounceTime } from 'rxjs/operators';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-offering',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UpdateProfileComponent,
    ChangePasswordComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './offering.component.html',
  styleUrl: './offering.component.scss',
})
export class OfferingComponent {
  successMessage: string = '';
  errorMessage: string = '';
  profile: any = {};
  showMyProfileModal = false;
  showProfile = false;
  role: string = '';
  username: string = '';
  avatar: string = '';
  offeringForm!: FormGroup;
  filterForm!: FormGroup;
  showModal = false;
  offerings: any[] = [];
  gods: any[] = [];
  isEditMode = false;
  selectedOfferingId: number | null = null;
  isLoading = false;

  @ViewChild(UpdateProfileComponent)
  updateProfilePopup!: UpdateProfileComponent;

  @ViewChild(ChangePasswordComponent)
  changePasswordPopup!: ChangePasswordComponent;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private fb: FormBuilder,
    private offeringService: OfferingService,
    private godsService: GodsService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeFilterForm();
    this.initializeForm();
    this.autoTranslate();
    this.loadOfferings();
    this.username = localStorage.getItem('name') || 'User';
    this.avatar = localStorage.getItem('avatar') || 'U';
    this.role = localStorage.getItem('role') || 'NULL';
  }

  getFirstName(username: string): string {
    if (!username) return '';
    const firstName = username.split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }

  initializeFilterForm() {
    this.filterForm = this.fb.group({
      offeringEnglish: [''],
    });
  }
  initializeForm() {
    this.offeringForm = this.fb.group({
      offeringEnglish: ['', Validators.required],
      offeringMalayalam: [''],
      offeringType: ['', Validators.required],
      price: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  autoTranslate() {
    this.offeringForm
      .get('offeringEnglish')
      ?.valueChanges.subscribe((value: string) => {
        if (!value) {
          this.offeringForm.get('offeringMalayalam')?.setValue('');
          return;
        }
        this.translateToMalayalam(value);
      });
  }

  translateToMalayalam(text: string) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ml&dt=t&q=${text}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const translatedText = data[0][0][0];

        this.offeringForm
          .get('offeringMalayalam')
          ?.setValue(translatedText, { emitEvent: false });
      })
      .catch((err) => console.error(err));
  }

  loadOfferings() {
    this.isLoading = true;
    const filters = this.filterForm.value;
    let queryParams: any = {};
    if (filters.offeringEnglish) {
      queryParams.offeringEnglish = filters.offeringEnglish;
    }

    const hasFilters = Object.keys(queryParams).length > 0;
    if (hasFilters) {
      this.offeringService
        .searchOffering(queryParams, this.page, this.size)
        .subscribe({
          next: (res: any) => {
            this.offerings = res.content;
            this.totalPages = res.totalPages;
            this.totalElements = res.totalElements;
            this.page = res.number;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading offerings', err);
            this.isLoading = false;
          },
        });
    } else {
      this.offeringService
        .getOfferings(this.page, this.size, 'createdDate')
        .subscribe({
          next: (res: any) => {
            this.offerings = res.content;
            this.totalElements = res.totalElements;
            this.totalPages = res.totalPages; // ✅ important
            this.page = res.number; // ✅ current page
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading offerings', err);
            this.isLoading = false;
          },
        });
    }
  }

  onSearch() {
    this.page = 0; // reset page
    this.loadOfferings();
  }

  onReset() {
    this.filterForm.reset();
    this.page = 0;
    this.loadOfferings();
  }

  changePage(newPage: number) {
    this.page = newPage;
    this.loadOfferings();
  }
  activeMenu: string | null = null;
  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  //ADD/EDIT POPUP OPEN CODE
  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.selectedOfferingId = null;
    this.initializeForm();
  }

  //ADD/EDIT POPUP CLOSE CODE
  closeModal() {
    this.showModal = false;
  }

  //---LOADING EDIT DATA -----

  editOffering(offering: any) {
    this.showModal = true;
    this.isEditMode = true;
    this.selectedOfferingId = offering.id;

    this.initializeForm();

    this.offeringForm.patchValue({
      offeringEnglish: offering.offeringEnglish,
      offeringMalayalam: offering.offeringMalayalam,
      offeringType: offering.offeringType,
      price: offering.price,
      status: offering.status,
    });
  }


  submitOffering() {
    if (this.offeringForm.invalid) {
      this.offeringForm.markAllAsTouched();
      return;
    }

    const formData = this.offeringForm.value;

    if (this.isEditMode && this.selectedOfferingId) {
      this.offeringService
        .updateOffering(this.selectedOfferingId, formData)
        .subscribe({
          next: () => {
            this.successMessage = 'Offering Updated Successfully';
            this.errorMessage = '';

            this.afterSave();
            this.autoHideMessage();
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Update Failed';
            this.successMessage = '';

            this.autoHideMessage();
          },
        });
    } else {
      this.offeringService.createOffering(formData).subscribe({
        next: () => {
          this.successMessage = 'Offering Created Successfully';
          this.errorMessage = '';

          this.afterSave();
          this.autoHideMessage();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Create Failed';
          this.successMessage = '';

          this.autoHideMessage();
        },
      });
    }
  }

  afterSave() {
    this.closeModal();
    this.loadOfferings();
  }

  autoHideMessage() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }


  deleteConfirmed() {
    if (!this.selectedOfferingId) return;

    this.offeringService.deleteOffering(this.selectedOfferingId).subscribe({
      next: () => {
        this.successMessage = 'Offering deleted successfully';
        this.loadOfferings();

        this.autoHideMessage();
      },

      error: () => {
        this.errorMessage = 'Delete failed';

        this.autoHideMessage();
      },
    });
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
    const rememberUser = localStorage.getItem('rememberUser');
    localStorage.clear();
    if (rememberUser) {
    localStorage.setItem('rememberUser', rememberUser);
    }
   this.router.navigate(['/login']);
  }

  @HostListener('document:click')
  closeOutsideProfile() {
    this.showProfile = false;
  }
  openMyProfile() {
    this.usersService.getMyProfile().subscribe((res) => {
      this.profile = res;
      this.showMyProfileModal = true;
    });
  }
}
