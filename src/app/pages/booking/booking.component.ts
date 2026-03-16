import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { OfferingService } from '../../services/offering.service';
import { Receipt } from '../../models/receipt.model';
import { Offering } from '../../models/offering.model';
import { UsersService } from '../../services/users.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';

@Component({
  selector: 'app-booking',
   standalone: true,
   imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent {
  successMessage: string = '';
    errorMessage: string = '';
  showProfile = false;
role: string = '';
 username: string = '';
  avatar: string = '';
  isAddModalOpen = false;
  receiptForm!: FormGroup;
updateForm!: FormGroup;
isUpdateModalOpen = false;
filterForm!: FormGroup;
isViewModalOpen = false;
selectedReceipt: any;
  profile: any = {};
     showMyProfileModal = false;

 @ViewChild(UpdateProfileComponent)
   updateProfilePopup!: UpdateProfileComponent;

  @ViewChild(ChangePasswordComponent)
  changePasswordPopup!: ChangePasswordComponent;

receiptLanguage: 'MALAYALAM' | 'ENGLISH' = 'MALAYALAM';


birthStars = [
  { value: 'aswathi', label: 'Aswathi - അശ്വതി' },
  { value: 'bharani', label: 'Bharani - ഭരണി' },
  { value: 'karthika', label: 'Karthika - കാർത്തിക' },
  { value: 'rohini', label: 'Rohini - രോഹിണി' },
  { value: 'makayiram', label: 'Makayiram - മകയിരം' },
  { value: 'thiruvathira', label: 'Thiruvathira - തിരുവാതിര' },
  { value: 'punartham', label: 'Punartham - പുനർതം' },
  { value: 'pooyam', label: 'Pooyam - പൂയം' },
  { value: 'ayilyam', label: 'Ayilyam - ആയില്യം' },
  { value: 'makam', label: 'Makam - മകം' },
  { value: 'poorom', label: 'Poorom - പൂരം' },
  { value: 'uthram', label: 'Uthram - ഉത്രം' },
  { value: 'atham', label: 'Atham - അത്തം' },
  { value: 'chithira', label: 'Chithira - ചിത്തിര' },
  { value: 'chothi', label: 'Chothi - ചോതി' },
  { value: 'visakham', label: 'Visakham - വിശാഖം' },
  { value: 'anizham', label: 'Anizham - അനിഴം' },
  { value: 'thrikketta', label: 'Thrikketta - തൃക്കേട്ട' },
  { value: 'moolam', label: 'Moolam - മൂലം' },
  { value: 'pooradam', label: 'Pooradam - പൂരാടം' },
  { value: 'uthradam', label: 'Uthradam - ഉത്രാടം' },
  { value: 'thiruvonam', label: 'Thiruvonam - തിരുവോണം' },
  { value: 'avittam', label: 'Avittam - അവിട്ടം' },
  { value: 'chathayam', label: 'Chathayam - ചതയം' },
  { value: 'pooruruttathi', label: 'Pooruruttathi - പൂരുരുട്ടാതി' },
  { value: 'uthruttathi', label: 'Uthruttathi - ഉത്രട്ടാതി' },
  { value: 'revathi', label: 'Revathi - രേവതി' }
];
    selectedReceiptId: number | null = null;

    receipts: Receipt[] = [];
    offerings: any[] = [];

    page = 0;
    size = 8;
    totalElements = 0;
    totalPages = 0;

    constructor(private bookingService: BookingService,
       private offeringService: OfferingService,
       private usersService: UsersService,
      private fb: FormBuilder) {}

    ngOnInit() {
       this.initializeForms();
      this.loadBookings();
      this.initForm();
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

  applyFilter() {
    this.page = 0; // reset to first page
    this.loadBookings();
  }
@ViewChild('endDateInput') endDateInput!: ElementRef;
@ViewChild('startDateInput') startDateInput!: ElementRef;
resetFilter() {
   this.filterForm.reset({
      receiptNumber: '',
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
  this.loadBookings();
}

loadBookings() {

  const filters = this.filterForm.value;

  let queryParams: any = {};

  if (filters.receiptNumber)
    queryParams.receiptNumber = filters.receiptNumber;

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

    this.bookingService
      .searchReceipts(queryParams, this.page, this.size)
      .subscribe({
        next: (res: any) => {
          this.receipts = res.content;
          this.totalElements = res.totalElements;
           this.totalPages = res.totalPages;   // ✅ important
           this.page = res.number;             // ✅ current page
        },
        error: (err) => {
          console.error('Search error', err);
        }
      });

  } else {

    this.bookingService
      .getReceipts(this.page, this.size, 'createdDate')
      .subscribe({
        next: (res: any) => {
          this.receipts = res.content;
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

changePage(newPage: number) {
  this.page = newPage;
  this.loadBookings();
}

loadOfferings() {
  this.offeringService.getOfferingsByStatus().subscribe(data => {
    this.offerings = data;
  });
}
onOfferingChange(index: number): void {

  const row = this.bookingsArray.at(index) as FormGroup;

  const selectedId = row.get('vazhipadu')?.value;

   if (!selectedId) {

      row.get('quantity')?.setValue(1);
      row.get('amount')?.setValue(0);

      // remove stored price
      (row as any).selectedPrice = null;

      return;
    }

  const selectedOffering = this.offerings.find(o => o.id == selectedId);

  if (selectedOffering) {

    row.get('price')?.setValue(selectedOffering.price);

    const quantity = row.get('quantity')?.value || 1;
    const total = selectedOffering.price * quantity;

    row.get('amount')?.setValue(total);
  }
}


// -----------------ADD POPUP ----------------

initForm() {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // yyyy-MM-dd

  this.receiptForm = this.fb.group({
    phoneNumber: [''],
    paymentType: ['', Validators.required],
    paymentStatus: ['', Validators.required],
    createdDate: [formattedDate, Validators.required],  // ✅ default today
    bookings: this.fb.array([this.createBookingRow()])
  });
 this.updateForm = this.fb.group({
    phoneNumber: [''],
    paymentType: [''],
    paymentStatus: ['']
  });
}
initializeForms() {
  this.filterForm = this.fb.group({
    receiptNumber: [''],
    paymentStatus: [''],
    paymentType: [''],
    startDate: [''],
    endDate: ['']
  });
}
createBookingRow(): FormGroup {

  const group = this.fb.group({
    vazhipadu: ['', Validators.required],
    quantity: [1, Validators.required],
    amount: [{ value: 0, disabled: true }, Validators.required],
    devoteeName: ['', Validators.required],
    birthStar: ['', Validators.required],
    price: [0, Validators.required]   // internal hidden price storage
  });

//change amount when change quantity
//  group.get('quantity')?.valueChanges.subscribe(qty => {
//
//    const quantity = qty ?? 0;
//    const price = group.get('price')?.value ?? 0;
//
//    group.get('amount')?.setValue(price * quantity);
//
//  });

  return group;
}

  get bookingsArray(): FormArray {
    return this.receiptForm.get('bookings') as FormArray;
  }
  addBookingRow() {
    if (this.bookingsArray.length < 5) {
      this.bookingsArray.push(this.createBookingRow());
    }
  }

  removeBookingRow(index: number) {
    if (this.bookingsArray.length > 1) {
      this.bookingsArray.removeAt(index);
    }
  }

  getTotalAmount(): number {
    return this.bookingsArray.controls.reduce((total, control) => {
      const amount = Number(control.get('amount')?.value || 0);
      const quantity = Number(control.get('quantity')?.value || 1);
      const totalAmt = amount * quantity;
      return total = total + totalAmt;
    }, 0);
  }

closeAddModal(): void {
  this.isAddModalOpen = false;
  this.resetForm();
}

openAddModal() {
  this.isAddModalOpen = true;
}
submitReceipt(): void {

  if (this.receiptForm.invalid) {
    this.receiptForm.markAllAsTouched();
    return;
  }


  // Get disabled values like amount
  const rawValue = this.receiptForm.getRawValue();

  // Map offering ID → offering name (if backend expects name instead of ID)
  const formattedBookings = rawValue.bookings.map((row: any) => {

    const selectedOffering = this.offerings.find(o => o.id == row.vazhipadu);

    return {
      bookingDate: rawValue.createdDate,
      vazhipadu: selectedOffering
        ? `${selectedOffering.offeringEnglish} - ${selectedOffering.offeringMalayalam}`
        : row.vazhipadu,
      quantity: row.quantity,
      amount: row.amount,
      devoteeName: row.devoteeName,
      birthStar: this.birthStars.find(
        star => star.value === row.birthStar
      )?.label || row.birthStar
    };
  });

  const payload = {
    phoneNumber: rawValue.phoneNumber,
    paymentType: rawValue.paymentType,
    paymentStatus: rawValue.paymentStatus,
    createdDate: rawValue.createdDate,
    bookings: formattedBookings
  };

  this.bookingService.saveBatchReceipt(payload)
//   .subscribe({
//     next: (res) => {
//       console.log("Saved successfully", res);
//       alert("Receipt Saved Successfully ✅");
//
//       this.closeAddModal();  // this should reset form also
//       this. loadBookings();
//     },
//     error: (err) => {
//       console.error("Error saving receipt", err);
//       alert("Failed to save receipt ❌");
//     }
//   });
.subscribe({
              next: (res) => {
          this.successMessage = 'Receipt Created Successfully';
          this.errorMessage = '';

         this.closeAddModal();
          this. loadBookings();
            // ⭐ OPEN PRINT MODAL
          this.openViewModal(res);

//     // ⭐ AUTO PRINT
//     setTimeout(() => {
//       window.print();
//     }, 500);
//
          this.autoHideMessage();

        },
        error: (err) => {

          this.errorMessage = err.error?.message || 'Update Failed';
          this.successMessage = '';

           this.closeAddModal();
          this. loadBookings();
          this.autoHideMessage();

        }
        });
}

autoHideMessage() {
  setTimeout(() => {
    this.successMessage = '';
    this.errorMessage = '';
  }, 3000);
}


@HostListener('document:keydown.escape', ['$event'])
handleEscape(event: KeyboardEvent) {
  if (this.closeAddModal) {
    this.closeAddModal();
  }
}

copyField(index: number, field: string, event: any) {
  const isChecked = event.target.checked;
  const bookings = this.bookingsArray;

  if (index === 0) return; // safety check (first row has no previous)

  const currentControl = bookings.at(index).get(field);
  const previousValue = bookings.at(index - 1).get(field)?.value;

  if (isChecked) {
    currentControl?.setValue(previousValue);
    currentControl?.disable();   // optional but recommended
  } else {
    currentControl?.enable();
    currentControl?.setValue('');
  }
}

resetForm(): void {

  this.receiptForm.reset();

  // Clear all child rows
  while (this.bookingsArray.length !== 0) {
    this.bookingsArray.removeAt(0);
  }

  // Add fresh default row
  this.bookingsArray.push(this.createBookingRow());

  // Set default created date to today
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  this.receiptForm.patchValue({
    createdDate: formattedDate,
    paymentStatus: 'PENDING'
  });

}

openUpdateModal(receipt: any) {

  this.selectedReceiptId = receipt.id;

  this.updateForm.patchValue({
    phoneNumber: receipt.phoneNumber,
    paymentType: receipt.paymentType,
    paymentStatus: receipt.paymentStatus
  });

  this.isUpdateModalOpen = true;
}
closeUpdateModal() {
  this.isUpdateModalOpen = false;
  this.updateForm.reset();
  this.selectedReceiptId = null;
}

updateReceipt() {

  if (!this.selectedReceiptId) return;

  const payload = this.updateForm.value;

  this.bookingService
      .updateBooking(this.selectedReceiptId, payload)
.subscribe({
              next: () => {
          this.successMessage = 'Receipt Updated Successfully';
          this.errorMessage = '';

         this.closeUpdateModal();
          this.loadBookings();
          this.autoHideMessage();

        },
        error: (err) => {

          this.errorMessage = err.error?.message || 'Update Failed';
          this.successMessage = '';

          this.closeUpdateModal();
          this.loadBookings();
          this.autoHideMessage();

        }
        });
}
openViewModal(receipt: any) {
  this.selectedReceipt = receipt;
  this.isViewModalOpen = true;
}

closeViewModal() {
  this.isViewModalOpen = false;
  this.selectedReceipt = null;
}

switchLanguage(lang: 'ENGLISH' | 'MALAYALAM') {
  this.receiptLanguage = lang;
}

// printReceipt() {
//   window.print();
// }


printReceipt() {
  const receipt = document.querySelector('.print-area') as HTMLElement;
  if (!receipt) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow!.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
            font-size: 15px;
          }

          /* HEADER */
          .receipt-container {
            text-align: center;
            position: relative;
              border: 2px solid #000;   /* 👈 ONLY BORDER */
              padding: 0px 20px 20px 20px;   /* reduced top padding */
          }
        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .temple-details h2,
        .temple-details h3,
        .temple-details p {
          margin: 5px 0;
        }

          /* IMAGES */
          .temple-img {
           width: 130px;
           height: auto;
           position: absolute;
           top: 10px;
          }

          .left-img { left: 10px; }
          .right-img { right: 10px; }

          /* RECEIPT INFO */
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 13px;
          }

          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid #000;
            padding: 6px 8px;       /* ✅ MORE SPACE */
            text-align: center;
            font-size: 13px;        /* ✅ BIGGER TEXT */
            line-height: 1.4;
          }

          th {
            font-weight: bold;
          }

          /* TOTAL & SIGNATURE */
          .grand-total {
            text-align: right;
            font-weight: bold;
            margin-top: 12px;
            font-size: 14px;
          }

          .signature {
            margin-top: 30px;
            text-align: right;
            font-size: 13px;
          }

          /* HIDE UI ELEMENTS */
          .receipt-actions,
          .modal-close,
          button {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${receipt.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();

  setTimeout(() => document.body.removeChild(iframe), 1000);
}

downloadReceipt() {
  if (!this.selectedReceipt) return;

  this.bookingService
    .downloadReceipt(this.selectedReceipt.id)
    .subscribe(blob => {

      const fileURL = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = fileURL;
      a.download = `Receipt_${this.selectedReceipt.receiptNumber}.pdf`;
      a.click();

      window.URL.revokeObjectURL(fileURL);
    });
}

   // ---------------- NAVBAR ----------------

  activeMenu: string | null = null;

  @ViewChild('menuContainer1') menuContainer1!: ElementRef;

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.menuContainer1?.nativeElement.contains(event.target)) {
      this.activeMenu = null;
    }
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
