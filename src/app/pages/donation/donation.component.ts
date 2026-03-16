import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DonationService } from '../../services/donation.service';
import { EventsService } from '../../services/events.service';
import html2canvas from 'html2canvas';
import { UsersService } from '../../services/users.service';
import jsPDF from 'jspdf';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-donation',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent, ConfirmDialogComponent],
  templateUrl: './donation.component.html',
  styleUrl: './donation.component.scss'
})
export class DonationComponent {
  successMessage: string = '';
    errorMessage: string = '';
role: string = '';
 username: string = '';
  avatar: string = '';
  donations: any[] = [];
  donationForm!: FormGroup;
  filterForm!: FormGroup;
  events: any[] = [];
  showPrintModal = false;
  selectedDonation: any = null;
  showModal = false;
  isEditMode = false;
  showProfile = false;
  selectedId: number | null = null;
  profile: any = {};
  showMyProfileModal = false;

@ViewChild(UpdateProfileComponent)
  updateProfilePopup!: UpdateProfileComponent;

 @ViewChild(ChangePasswordComponent)
 changePasswordPopup!: ChangePasswordComponent;

  page = 0;
  size = 5;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private eventsService: EventsService,
     private usersService: UsersService
  ) {}

activeMenu: string | null = null;
toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  ngOnInit() {
    this.filterInitializeForms();
    this.initializeForm();
    this.loadDonations();
    this.loadEvents();
     this.username = localStorage.getItem('name') || 'User';
      this.avatar = localStorage.getItem('avatar') || 'U';
      this.role = localStorage.getItem('role') || 'NULL';
  }

getFirstName(username: string): string {
  if (!username) return '';
  const firstName = username.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}

filterInitializeForms() {
  this.filterForm = this.fb.group({
    devoteeName: [''],
    paymentStatus: [''],
    paymentType: [''],
    startDate: [''],
    endDate: ['']
  });
}
  initializeForm() {
    this.donationForm = this.fb.group({
      donationDate: ['', Validators.required],
      paymentType: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      receiptBookNo: [''],
      receiptNo: [''],
      devoteeName: ['', Validators.required],
      address: [''],
      phoneNo: ['', Validators.required],
      amount: ['', Validators.required],
      donateFor: ['', Validators.required],
      remarks: ['']
    });
  }

  loadDonations() {

      const filters = this.filterForm.value;

      let queryParams: any = {};

      if (filters.devoteeName)
        queryParams.devoteeName = filters.devoteeName;

      if (filters.paymentStatus)
        queryParams.paymentStatus = filters.paymentStatus;

      if (filters.paymentType)
        queryParams.paymentType = filters.paymentType;

      if (filters.startDate)
        queryParams.startDate = filters.startDate;

      if (filters.endDate)
        queryParams.endDate = filters.endDate;

      const hasFilters = Object.keys(queryParams).length > 0;

    if (hasFilters) {
       this.donationService
            .searchDonations(queryParams, this.page, this.size)
            .subscribe({
              next: (res: any) => {
                this.donations = res.content;
                this.totalElements = res.totalElements;
                 this.totalPages = res.totalPages;   // ✅ important
                 this.page = res.number;             // ✅ current page
              },
              error: (err) => {
                console.error('Search error', err);
              }
            });
      }else{
            this.donationService
                  .getDonations(this.page, this.size, 'createdDate')
                  .subscribe({
                    next: (res: any) => {
                      this.donations = res.content;
                      this.totalElements = res.totalElements;
                       this.totalPages = res.totalPages;   // ✅ important
                       this.page = res.number;             // ✅ current page
                    },
                    error: (err) => {
                      console.error('Error loading receipts', err);
                    }
                  });
        }
  }

  loadEvents() {
    this.eventsService.getEvents(this.page, this.size, 'createdDate')
      .subscribe((res: any) => {
        this.events = res.content;
        this.totalPages = res.totalPages;
      });
  }
  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.selectedId = null;
    this.donationForm.reset();
  }

  closeModal() {
    this.showModal = false;
  }

  editDonation(d: any) {
    this.showModal = true;
    this.isEditMode = true;
    this.selectedId = d.id;

    this.donationForm.patchValue(d);
  }

  submitDonation() {

    if (this.donationForm.invalid) {
      this.donationForm.markAllAsTouched();
      return;
    }

    const data = this.donationForm.value;

    if (this.isEditMode && this.selectedId) {

      this.donationService.updateDonation(this.selectedId, data)
//         .subscribe(() => {
//           alert('Donation Updated Successfully');
//           this.afterSave();
//         });
.subscribe({
              next: () => {
          this.successMessage = 'Donation Updated Successfully';
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

      this.donationService.createDonation(data)
//         .subscribe(() => {
//           alert('Donation Added Successfully');
//           this.afterSave();
//         });
.subscribe({
       next: () => {

         this.successMessage = 'Donation Created Successfully';
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

//   deleteDonation(id: number) {
//
//     if (!confirm('Are you sure you want to delete this donation?')) {
//       return;
//     }
//
//     this.donationService.deleteDonation(id)
//       .subscribe(() => {
//         alert('Deleted Successfully');
//         this.loadDonations();
//       });
//   }
deleteConfirmed(){

  if(!this.selectedId) return;

  this.donationService.deleteDonation(this.selectedId)
  .subscribe({

    next:()=>{

      this.successMessage = "Donation deleted successfully";
       this.loadDonations();

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
    this.loadDonations();
  }

changePage(newPage: number) {
    this.page = newPage;
    this.loadDonations();
  }

 applyFilter() {
    this.page = 0; // reset to first page
    this.loadDonations();
  }
@ViewChild('endDateInput') endDateInput!: ElementRef;
@ViewChild('startDateInput') startDateInput!: ElementRef;
resetFilter() {
   this.filterForm.reset({
      devoteeName: '',
      paymentStatus: '',
      paymentType: '',
      startDate: '',
      endDate: ''
    });
 if (this.endDateInput) {
    this.endDateInput.nativeElement.type = 'text';
  }
 if (this.startDateInput) {
    this.startDateInput.nativeElement.type = 'text';
  }

  this.page = 0;
  this.loadDonations();
}



openPrintPopup(donation: any) {
  this.selectedDonation = donation;
  this.showPrintModal = true;
}

closePrintPopup() {
  this.showPrintModal = false;
}

printReceipt() {
  window.print();
}

downloadPDF() {
  const data = document.getElementById('receiptSection');

  if (!data) return;

  html2canvas(data, {
    scale: 2, // better quality
    useCORS: true
  }).then(canvas => {

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    const heightLeft = imgHeight;

    const contentDataURL = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);

    pdf.save('Donation_Receipt_' + this.selectedDonation?.receiptNo + '.pdf');
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
