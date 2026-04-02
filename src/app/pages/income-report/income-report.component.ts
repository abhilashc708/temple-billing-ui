import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IncomeEntryService } from '../../services/income-entry.service';
import { FinanceManagerService } from '../../services/finance-manager.service';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';


@Component({
  selector: 'app-income-report',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent],
  templateUrl: './income-report.component.html',
  styleUrl: './income-report.component.scss'
})
export class IncomeReportComponent {

  @ViewChild(UpdateProfileComponent)
    updateProfilePopup!: UpdateProfileComponent;

   @ViewChild(ChangePasswordComponent)
   changePasswordPopup!: ChangePasswordComponent;

isAllSelected: boolean = false;
  profile: any = {};
       showMyProfileModal = false;
  showProfile = false;
  role: string = '';
    username: string = '';
    avatar: string = '';
searchForm!: FormGroup;
  reportList: any[] = [];
  financeList: any[] = [];
  selectedIncomeTypes: string[] = [];
   search: any = {
        receiptFrom: [''],
        receiptTo: ['']
      };
       page = 0;
        size = 5;
        totalElements = 0;
        totalPages = 0;
         constructor(
              private fb: FormBuilder,
              private incomeEntryService: IncomeEntryService,
               private financeService: FinanceManagerService,
                 private usersService: UsersService,
                 private router: Router
            ) {}

     ngOnInit(): void {

          this.searchForm = this.fb.group({
            incomeTypes: [''],
            receiptFrom: [''],
            receiptTo: ['']
          });
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


    getReport() {
      const payload = {
        receiptFrom: this.searchForm.value.receiptFrom,
        receiptTo: this.searchForm.value.receiptTo,
        incomeTypes: this.selectedIncomeTypes   // ✅ ARRAY
      };

      this.incomeEntryService.searchIncomeReport(payload).subscribe((res:any) => {
       // this.reportList = res.content;
        this.reportList = res;
      });
    }

     loadFinanceList() {
             this.financeService.getAllByType('INCOME',this.page, this.size, 'createdDate')
                  .subscribe(res => {
                    this.financeList = res.content;
                    this.totalPages = res.totalPages;
                  });
      }

    clearForm(){
        this.searchForm.reset();
        this.reportList=[];
        this.selectedIncomeTypes=[];
          this.isAllSelected = false;   // 🔥 IMPORTANT
      }

      refreshPage(){
        window.location.reload();
      }

        activeMenu: string | null = null;
        toggleMenu(menu: string) {
            this.activeMenu = this.activeMenu === menu ? null : menu;
          }

        getGrandTotal(): number {

            if (!this.reportList || this.reportList.length === 0) {
              return 0;
            }

            return this.reportList.reduce((sum, item) => {

              return sum + (item.amount || 0);

            }, 0);

          }

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

                <title>Income Report</title>

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
onIncomeTypeChange(event: any) {
  const value = event.target.value;

  if (event.target.checked) {
    this.selectedIncomeTypes.push(value);
  } else {
    this.selectedIncomeTypes = this.selectedIncomeTypes.filter(v => v !== value);
  }

  // 🔥 AUTO UPDATE SELECT ALL STATE
  this.isAllSelected = this.selectedIncomeTypes.length === this.financeList.length;
}
toggleAll(event: any) {
  this.isAllSelected = event.target.checked;

  if (this.isAllSelected) {
    this.selectedIncomeTypes = this.financeList.map(f => f.title);
  } else {
    this.selectedIncomeTypes = [];
  }
}
}
