import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
  showReceiptFields = false;
  showReceiptPopup = false;

@ViewChild(UpdateProfileComponent)
  updateProfilePopup!: UpdateProfileComponent;

 @ViewChild(ChangePasswordComponent)
 changePasswordPopup!: ChangePasswordComponent;

  page = 0;
  size = 8;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private eventsService: EventsService,
     private usersService: UsersService,
      private router: Router
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
      paymentStatus: ['SUCCESS', Validators.required],
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

     const today = new Date().toISOString().split('T')[0];

      const receiptBookNo = this.generateReceiptBookNo();
      const receiptNo = this.generateReceiptNo();

      this.donationForm.reset({
        donationDate: today,
        paymentStatus: 'SUCCESS',
        receiptBookNo: receiptBookNo,
        receiptNo: receiptNo
      });
  }

generateReceiptBookNo(): string {
  const num = Math.floor(Math.random() * 9) + 1; // 1–9
  return `RB-0${num}`;
}

generateReceiptNo(): string {
  return Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit
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
     // paymentType: '',
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
  this.showReceiptPopup = true;
}

closePrintPopup() {
   this.showReceiptPopup = false;
}

// printReceipt() {
//   window.print();
// }
printReceipt() {
  const receipt = document.getElementById('receiptSection') as HTMLElement;
  if (!receipt) return;

  const html = receipt.outerHTML.replaceAll(
    'src="assets/',
    `src="${window.location.origin}/assets/`
  );

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
            size: legal portrait;
            margin: 0.5mm;
          }

          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            margin: 0;
            padding: 4px;
            font-family: "Times New Roman", serif;
            font-size: 10px; /* ✅ FIX 2 */
          }

          /* 🔥 MAIN RECEIPT BOX (LIKE BOOKING) */
          .donation-template {
            width: 100%;
            height: 4.5in;    /* ✅ EXACT 1/3 LEGAL */
              border: 2px solid black !important;
            padding: 6px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
             position: relative;
             page-break-after: always;
             margin-top: 2px;/* ✅ IMPORTANT */
          }

          /* HEADER */
          .donation-header-row {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .donation-logo {
            width: 140px;   /* 🔥 reduced */
            height: 140px;
            border-radius: 50%;
          }

          .donation-header-text {
            flex: 1;
            text-align: center;
          }

          .donation-header-text h2 {
            margin: 2px 0;
            font-size: 30px;
          }

          .donation-header-text p {
            margin: 1px 0;
            font-size: 15px;
          }

          /* TITLE */
          .donation-title-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }

          .donation-title {
            font-size: 20px;
            font-weight: bold;
          }

          .donation-meta {
            width: 200px;
          }

          .meta-table {
            width: 100%;
            border-collapse: collapse;
          }

          .meta-table td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 12px;
          }

          .meta-label {
            width: 40%;
            background: #f2f2f2;
            font-weight: bold;
          }

          /* TABLE */
          .donation-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2px;
          }

          .donation-table td {
            border: 1px solid #000;
            padding: 6px;
            font-size: 12px;
          }

          .donation-table td.label {
            width: 35%;
            background: #f2f2f2;
            font-weight: bold;
          }

          /* FOOTER */
          .donation-footer {
            display: flex;
            justify-content: space-between;
            margin-top: auto;   /* 🔥 pushes to bottom */
            font-size: 12px;
          }

          .contact-line {
            display: flex;
            justify-content: center;
            gap: 4px;
            font-size: 12px;
          }

          .icon-img {
            width: 14px;
            height: 14px;
          }

          .no-print {
            display: none !important;
          }

        </style>
      </head>

      <body>
        ${html}
      </body>
    </html>
  `);

  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
    }, 300);
  };

  setTimeout(() => document.body.removeChild(iframe), 1500);
}
// printReceipt() {
//   const content = document.getElementById('printWrapper')?.innerHTML;
//   if (!content) return;
//
//   const iframe = document.createElement('iframe');
//   iframe.style.position = 'fixed';
//   iframe.style.right = '0';
//   iframe.style.bottom = '0';
//   iframe.style.width = '0';
//   iframe.style.height = '0';
//   iframe.style.border = '0';
//
//   document.body.appendChild(iframe);
//
//   const doc = iframe.contentWindow!.document;
//   doc.open();
//
//   doc.write(`
//     <html>
//       <head>
//         <title>Print Receipt</title>
//
//         <style>
//           @page {
//             size: legal portrait;
//             margin: 2mm;
//           }
//
//           body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 8px;
//              font-size: 10px; /* ✅ SAME AS BOOKING */
//           }
//
//           /* 🔥 Wrapper (TOP TEXT + RECEIPT) */
//           .print-wrapper {
//             width: 210mm;
//           }
//
//           /* 🔥 TOP OUTSIDE HEADER */
//           .top-outside {
//             display: flex;
//                        justify-content: space-between;
//                        font-size: 12px;
//                         align-items: center;   /* 🔥 IMPORTANT */
//                        margin-bottom: 4px; /* space before border */
//                        padding: 0 2px;
//                         line-height: 1;
//           }
//
//           .left-text {
//             text-align: left;
//           }
//
//           .right-text {
//             text-align: right;
//           }
//
//           /* 🔥 MAIN RECEIPT BOX */
//           .receipt-container {
//             width: 100%;
//             height: 4.4in; /* ✅ SAME */
//             border: 2px solid black !important;
//             padding: 6px;
//             box-sizing: border-box;
//             margin: 0;
//             text-align: center;
//             position: relative;
//             page-break-after: always;
//             display: flex;
//             flex-direction: column;
//           }
//
//           /* 🔥 IMAGE FIX (VERY IMPORTANT) */
//           img {
//             max-width: 100%;
//             height: auto;
//            // display: block;
//           }
//
//           .temple-img {
//             width: 120px !important;
//             height: 90px !important;
//             object-fit: cover;
//           }
//
//           /* 🔥 HEADER */
//           .receipt-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//           }
//
//           .receipt-title {
//             text-align: center;
//             flex: 1;
//           }
//
//           .receipt-title h2,
//           .receipt-title p {
//             margin: 2px 0;
//           }
//
//           /* 🔥 TOP ROW */
//           .receipt-top {
//             display: flex;
//             justify-content: space-between;
//             font-weight: bold;
//             margin-top: 5px;
//           }
//
//           /* 🔥 BODY */
//           .receipt-body {
//             text-align: center;
//             font-size: 14px;
//             line-height: 20px;
//           }
//
//           .donation-text {
//             text-align: center;
//           }
//
//           .amount-box {
//             background: black;
//             color: white;
//             display: inline-block;
//             padding: 6px 12px;
//             margin-top: 10px;
//              text-align: left !important;
//           }
//         .amount-wrapper {
//           text-align: left !important;
//         }
//
//           /* 🔥 FOOTER FIXED */
//           .bottom-section {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-end;
//             margin-top: auto;
//             padding-bottom: 0;
//           }
//
//           .upi {
//             font-size: 10px;
//           }
//
//           .signature {
//             font-size: 10px;
//             text-align: right;
//           }
//
//           /* ❌ REMOVE BUTTONS */
//           .no-print {
//             display: none !important;
//           }
//          .contact-line {
//                   display: flex;
//                   align-items: center;
//                   justify-content: center; /* center like your header */
//                   gap: 6px;
//                   font-size: 14px;
//                 }
//
//                 .icon-img {
//                   width: 16px;
//                   height: 16px;
//                   position: static;   /* 🔥 FIX: remove absolute */
//                 }
//                 .upi-icon-img {
//                   width: 15px;
//                   height: 15px;
//                   position: static;   /* 🔥 FIX: remove absolute */
//                 }
//
//
//         </style>
//       </head>
//
//       <body>
//         <div class="print-wrapper">
//           ${content}
//         </div>
//       </body>
//     </html>
//   `);
//
//   doc.close();
//
//   iframe.contentWindow!.focus();
//   iframe.contentWindow!.print();
//
//   setTimeout(() => {
//     document.body.removeChild(iframe);
//   }, 1000);
// }

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

convertToWords(amount: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const numToWords = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100)
      return tens[Math.floor(num / 10)] + " " + ones[num % 10];
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred " +
        numToWords(num % 100)
      );
    if (num < 100000)
      return (
        numToWords(Math.floor(num / 1000)) +
        " Thousand " +
        numToWords(num % 1000)
      );
    if (num < 10000000)
      return (
        numToWords(Math.floor(num / 100000)) +
        " Lakh " +
        numToWords(num % 100000)
      );
    return (
      numToWords(Math.floor(num / 10000000)) +
      " Crore " +
      numToWords(num % 10000000)
    );
  };

  return numToWords(amount).trim() + " Rupees Only /-";
}
}
