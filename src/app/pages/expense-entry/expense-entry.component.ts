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
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ExpenseEntryService } from '../../services/expense-entry.service';
import { FinanceManagerService } from '../../services/finance-manager.service';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-expense-entry',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    UpdateProfileComponent,
    ChangePasswordComponent,
  ],
  templateUrl: './expense-entry.component.html',
  styleUrl: './expense-entry.component.scss',
})
export class ExpenseEntryComponent {
  successMessage: string = '';
  errorMessage: string = '';
  role: string = '';
  username: string = '';
  avatar: string = '';
  expenseList: any[] = [];
  expenseForm!: FormGroup;
  financeList: any[] = [];
  filterForm!: FormGroup;
  showPrintModal = false;
  selectedExpense: any;
  showProfile = false;
  profile: any = {};
  showMyProfileModal = false;

  showModal = false;
  isEditMode = false;
  selectedId: number | null = null;

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
    private expenseService: ExpenseEntryService,
    private financeService: FinanceManagerService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.filterInitializeForms();
    this.initForm();
    this.loadExpenseList();
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

  filterInitializeForms() {
    this.filterForm = this.fb.group({
      receiptNo: [''],
      receiptFrom: [''],
      receiptTo: [''],
      remarks: [''],
    });
  }
  applyFilter() {
    this.page = 0; // reset to first page
    this.loadExpenseList();
  }
  @ViewChild('receiptToInput') receiptToInput!: ElementRef;
  @ViewChild('receiptFromInput') receiptFromInput!: ElementRef;
  resetFilter() {
    this.filterForm.reset({
      receiptNo: '',
      receiptFrom: '',
      receiptTo: '',
      remarks: '',
    });
    if (this.receiptToInput) {
      this.receiptToInput.nativeElement.type = 'text';
    }
    if (this.receiptFromInput) {
      this.receiptFromInput.nativeElement.type = 'text';
    }

    this.page = 0;
    this.loadExpenseList();
  }
  loadFinanceList() {
    this.financeService
      .getAllByType('EXPENSE', this.page, this.size, 'createdDate')
      .subscribe((res) => {
        this.financeList = res.content;
        this.totalPages = res.totalPages;
      });
  }
  activeMenu: string | null = null;
  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  initForm() {
    this.expenseForm = this.fb.group({
      receiptDate: ['', Validators.required],
      paidTo: ['', Validators.required],
      expenseType: ['', Validators.required],
      amount: ['', Validators.required],
      modeOfExpense: ['', Validators.required],
      chequeNo: [''],
      chequeDate: [''],
      remarks: [''],
    });
  }

  loadExpenseList() {
    const filters = this.filterForm.value;

    let queryParams: any = {};

    if (filters.receiptNo) queryParams.receiptNo = filters.receiptNo;

    if (filters.receiptFrom) queryParams.receiptFrom = filters.receiptFrom;

    if (filters.receiptTo) queryParams.receiptTo = filters.receiptTo;

    if (filters.remarks) queryParams.remarks = filters.remarks;

    const hasFilters = Object.keys(queryParams).length > 0;

    if (hasFilters) {
      this.expenseService
        .searchExpense(queryParams, this.page, this.size)
        .subscribe({
          next: (res: any) => {
            this.expenseList = res.content;
            this.totalElements = res.totalElements;
            this.totalPages = res.totalPages; // ✅ important
            this.page = res.number; // ✅ current page
          },
          error: (err) => {
            console.error('Search error', err);
          },
        });
    } else {
      this.expenseService
        .getAll(this.page, this.size, 'createdDate')
        .subscribe({
          next: (res: any) => {
            this.expenseList = res.content;
            this.totalElements = res.totalElements;
            this.totalPages = res.totalPages; // ✅ important
            this.page = res.number; // ✅ current page
          },
          error: (err) => {
            console.error('Search error', err);
          },
        });
    }
  }

  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.selectedId = null;
    this.expenseForm.reset();
  }

  closeModal() {
    this.showModal = false;
  }

  editExpense(item: any) {
    this.showModal = true;
    this.isEditMode = true;
    this.selectedId = item.id;

    this.expenseForm.patchValue(item);
  }
  submitExpense() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const data = this.expenseForm.value;

    if (this.isEditMode && this.selectedId) {
      this.expenseService
        .update(this.selectedId, data)
        .subscribe({
          next: () => {
            this.successMessage = 'Expense Entry Updated Successfully';
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
      this.expenseService
        .create(data)
        .subscribe({
          next: () => {
            this.successMessage = 'Expense Entry Created Successfully';
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

  autoHideMessage() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  deleteConfirmed() {
    if (!this.selectedId) return;

    this.expenseService.delete(this.selectedId).subscribe({
      next: () => {
        this.successMessage = 'Expense Entry deleted successfully';
        this.loadExpenseList();

        this.autoHideMessage();
      },

      error: () => {
        this.errorMessage = 'Delete failed';

        this.autoHideMessage();
      },
    });
  }

  afterSave() {
    this.closeModal();
    this.loadExpenseList();
  }
  get isChequeMode() {
    return this.expenseForm.get('modeOfExpense')?.value === 'CHEQUE';
  }
  changePage(newPage: number) {
    this.page = newPage;
    this.loadExpenseList();
  }

  printExpense(item: any) {
    this.selectedExpense = item;
    this.showPrintModal = true;
  }
  closePrintModal() {
    this.showPrintModal = false;
  }

  printReceipt() {
    const receipt = document.getElementById('printSection') as HTMLElement;
    if (!receipt) return;

    // ✅ Fix image paths (VERY IMPORTANT)
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
        <title>Receipt Print</title>

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
            font-family: Arial, sans-serif;
            font-size: 10px;
          }

          /* 🔥 MAIN RECEIPT (1/3 LEGAL PAGE) */
          .receipt-wrapper {
            width: 100%;
           height: 4.5in;
            box-sizing: border-box;
            border: 2px solid black;
            padding: 10px;
             margin-top: 2px;/* ✅ IMPORTANT */
            display: flex;
            flex-direction: column;
          }

          /* HEADER */
          .receipt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          /* IMAGE */
          .temple-img {
            width: 110px;
            height: 100px;
            border-radius: 8px;
          }

          /* TITLE */
          .receipt-title {
            text-align: center;
            flex: 1;
          }

          .receipt-title h3,
          .receipt-title p {
            margin: 2px 0;
          }

          /* INFO ROW */
          .receipt-info {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 10px;
          }

          /* TABLE */
          .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }

          .receipt-table td {
            border: 1px solid #000;
            padding: 5px;
            font-size: 11px;
          }

          /* FOOTER */
          .signature {
            margin-top: auto;   /* 🔥 stick to bottom */
            text-align: right;
            font-size: 11px;
          }

          /* HIDE BUTTONS */
          button,
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

  convertToWords(amount: number): string {
    if (amount == null) return '';

    const ones = [
      '',
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
      'TEN',
      'ELEVEN',
      'TWELVE',
      'THIRTEEN',
      'FOURTEEN',
      'FIFTEEN',
      'SIXTEEN',
      'SEVENTEEN',
      'EIGHTEEN',
      'NINETEEN',
    ];

    const tens = [
      '',
      '',
      'TWENTY',
      'THIRTY',
      'FORTY',
      'FIFTY',
      'SIXTY',
      'SEVENTY',
      'EIGHTY',
      'NINETY',
    ];

    const numToWords = (num: number): string => {
      if (num < 20) return ones[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
        );
      if (num < 1000)
        return (
          ones[Math.floor(num / 100)] +
          ' HUNDRED' +
          (num % 100 ? ' AND ' + numToWords(num % 100) : '')
        );
      if (num < 100000)
        return (
          numToWords(Math.floor(num / 1000)) +
          ' THOUSAND' +
          (num % 1000 ? ' ' + numToWords(num % 1000) : '')
        );
      if (num < 10000000)
        return (
          numToWords(Math.floor(num / 100000)) +
          ' LAKH' +
          (num % 100000 ? ' ' + numToWords(num % 100000) : '')
        );
      return (
        numToWords(Math.floor(num / 10000000)) +
        ' CRORE' +
        (num % 10000000 ? ' ' + numToWords(num % 10000000) : '')
      );
    };

    return numToWords(Math.floor(amount)) + ' RUPEES ONLY';
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
