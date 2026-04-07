import { CommonModule } from '@angular/common';
import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { IncomeEntryService } from '../../services/income-entry.service';
import { ExpenseEntryService } from '../../services/expense-entry.service'; // 👈 ADD THIS
import { FinanceManagerService } from '../../services/finance-manager.service';
import { UsersService } from '../../services/users.service';

import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';

@Component({
  selector: 'app-income-summary',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UpdateProfileComponent,
    ChangePasswordComponent
  ],
  templateUrl: './income-summary.component.html',
  styleUrl: './income-summary.component.scss'
})
export class IncomeSummaryComponent implements OnInit {

  @ViewChild(UpdateProfileComponent)
  updateProfilePopup!: UpdateProfileComponent;

  @ViewChild(ChangePasswordComponent)
  changePasswordPopup!: ChangePasswordComponent;

  // ✅ UI STATE
  isAllSelected: boolean = false;
  showProfile = false;
  showMyProfileModal = false;

  // ✅ USER INFO
  role: string = '';
  username: string = '';
  avatar: string = '';
  profile: any = {};

  // ✅ FORM
  searchForm!: FormGroup;

  // ✅ DATA
  summaryList: any[] = [];
  financeList: any[] = [];
  selectedTypes: string[] = [];

  // ✅ TYPE SWITCH (INCOME / EXPENSE)
  selectedCategory: string = ''; // 🔥 NEW

  // ✅ PAGINATION
  page = 0;
  size = 5;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private incomeService: IncomeEntryService,
    private expenseService: ExpenseEntryService, // 👈 NEW
    private financeService: FinanceManagerService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
     reportType: ['', Validators.required],   // ✅ REQUIRED
      type: ['DAY'],              // 🔥 DEFAULT DAY
      receiptFrom: [''],
      receiptTo: ['']
    });

    this.loadFinanceList();

    this.username = localStorage.getItem('name') || 'User';
    this.avatar = localStorage.getItem('avatar') || 'U';
    this.role = localStorage.getItem('role') || 'NULL';
  }

  // ✅ LOAD TYPES (INCOME / EXPENSE)
  loadFinanceList() {
    if (!this.selectedCategory) return; // 🔥 prevent empty call
    this.financeService
      .getAllByType(this.selectedCategory, this.page, this.size, 'createdDate')
      .subscribe(res => {
        this.financeList = res.content;
        this.totalPages = res.totalPages;
      });
  }

  // ✅ SWITCH BETWEEN INCOME / EXPENSE
//   onCategoryChange(type: string) {
//     this.selectedCategory = type;
//     this.selectedTypes = [];
//     this.isAllSelected = false;
//     this.loadFinanceList();
//   }
onCategoryChange(value: string) {
  this.selectedCategory = value;

  this.selectedTypes = [];
  this.isAllSelected = false;

  this.loadFinanceList(); // ✅ ONE METHOD HANDLES BOTH
}

  // ✅ GET SUMMARY
//   getSummary() {
//     const payload = {
//       receiptFrom: this.searchForm.value.receiptFrom,
//       receiptTo: this.searchForm.value.receiptTo,
//       types: this.selectedTypes
//     };
//
//     const apiCall =
//       this.selectedCategory === 'INCOME'
//         ? this.incomeService.getSummary(payload)
//         : this.expenseService.getSummary(payload);
//
//     apiCall.subscribe((res: any) => {
//       this.summaryList = res;
//     });
//   }
getSummary() {
if (this.searchForm.invalid) {
    this.searchForm.markAllAsTouched();  // 🔥 triggers error UI
    return;
  }
  const payload = {
    rangeType: this.searchForm.value.type,
    receiptFrom: this.searchForm.value.receiptFrom,
    receiptTo: this.searchForm.value.receiptTo,
    incomeTypes: this.selectedTypes   // 🔥 SAME key for both
  };

  if (this.selectedCategory === 'INCOME') {

    this.incomeService.getSummaryReport(payload).subscribe((res: any) => {
      this.summaryList = res;
    });

  } else {

    this.expenseService.getSummaryReport(payload).subscribe((res: any) => {
      this.summaryList = res;
    });

  }
}

  // ✅ CLEAR FORM (🔥 YOUR REQUIREMENT)
//   clearForm() {
//     this.searchForm.reset();
//
//     // 🔥 FORCE DEFAULT = DAY
//     this.searchForm.patchValue({
//       type: 'DAY'
//     });
//
//     this.summaryList = [];
//     this.selectedTypes = [];
//     this.isAllSelected = false;
//   }
// clearForm() {
//   this.searchForm.reset({
//     reportType: '',   // ✅ RESET DROPDOWN
//     type: 'DAY',
//     receiptFrom: '',
//     receiptTo: ''
//   });
//
//   this.summaryList = [];
//   this.selectedTypes = [];
//   this.isAllSelected = false;
// }
clearForm() {
  this.searchForm.reset({
    reportType: '',
    type: 'DAY',
    receiptFrom: '',
    receiptTo: ''
  });

  this.selectedCategory = '';   // 🔥 THIS LINE IMPORTANT
  this.summaryList = [];
  this.selectedTypes = [];
  this.isAllSelected = false;
}

  // ✅ CHECKBOX
  onTypeChange(event: any) {
    const value = event.target.value;

    if (event.target.checked) {
      this.selectedTypes.push(value);
    } else {
      this.selectedTypes = this.selectedTypes.filter(v => v !== value);
    }

    this.isAllSelected = this.selectedTypes.length === this.financeList.length;
  }

  toggleAll(event: any) {
    this.isAllSelected = event.target.checked;

    if (this.isAllSelected) {
      this.selectedTypes = this.financeList.map(f => f.title);
    } else {
      this.selectedTypes = [];
    }
  }

  // ✅ MENU
  activeMenu: string | null = null;

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  // ✅ TOTAL
  getGrandTotal(): number {
    return this.summaryList.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);
  }

  // ✅ PRINT
   printReport() {

              const printContents =
                document.getElementById('reportSection')?.innerHTML;

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

                  <title>Summary Report</title>

                  <style>

                    body{
                      font-family: Arial, sans-serif;
                      padding:20px;
                    }

                    table{
                      width:100%;
                      border-collapse:collapse;
                    }

                    th, td{
                      border:1px solid black;
                      padding:6px;
                      font-size:13px;
                      text-align:center;
                    }

                    th{
                      background:#f2f2f2;
                    }

                    .temple-header{
                      text-align:center;
                      margin-bottom:10px;
                    }

                    .grand-total td{
                      font-weight:bold;
                      text-align:right;
                    }

                  </style>

                </head>

                <body>

                  ${printContents}

                </body>

                </html>

              `);

              doc.close();
                iframe.contentWindow!.focus();
                iframe.contentWindow!.print();
                setTimeout(() => document.body.removeChild(iframe), 1000);

            }
  // ✅ USER
  getFirstName(username: string): string {
    return username ? username.split(' ')[0] : '';
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isUser(): boolean {
    return this.role === 'USER';
  }

  // ✅ PROFILE
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

  openMyProfile() {
    this.usersService.getMyProfile().subscribe(res => {
      this.profile = res;
      this.showMyProfileModal = true;
    });
  }
refreshPage() {
  window.location.reload();
}
downloadReport() {
  const element = document.getElementById('reportSection');
  if (!element) return;

  // ✅ GET TODAY DATE (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const opt = {
    margin: [0.3, 0.3, 0.5, 0.3],
    filename: `Finance_Report_${today}.pdf`, // 🔥 DYNAMIC NAME
    image: { type: 'jpeg' as const, quality: 1 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  import('html2pdf.js').then((html2pdf: any) => {
    html2pdf.default().set(opt).from(element).save();
  });
}
}
