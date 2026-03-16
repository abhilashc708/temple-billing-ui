import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ExpenseEntryService } from '../../services/expense-entry.service';
import { FinanceManagerService } from '../../services/finance-manager.service';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';

@Component({
  selector: 'app-expense-report',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent],
  templateUrl: './expense-report.component.html',
  styleUrl: './expense-report.component.scss'
})
export class ExpenseReportComponent {
  @ViewChild(UpdateProfileComponent)
    updateProfilePopup!: UpdateProfileComponent;

   @ViewChild(ChangePasswordComponent)
   changePasswordPopup!: ChangePasswordComponent;

     profile: any = {};
       showMyProfileModal = false;
  showProfile = false;
  role: string = '';
   username: string = '';
    avatar: string = '';
searchForm!: FormGroup;
  reportList: any[] = [];
  financeList: any[] = [];
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
              private expenseEntryService: ExpenseEntryService,
               private financeService: FinanceManagerService,
                private usersService: UsersService
            ) {}

     ngOnInit(): void {

          this.searchForm = this.fb.group({
            expenseTypes: [''],
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
      getReport(){
        const payload = Object.fromEntries(
          Object.entries(this.searchForm.value)
            .map(([k,v]) => [k, v === '' ? null : v])
        );
        this.expenseEntryService.searchExpenseReport(payload).subscribe((res:any)=>{
          this.reportList = res.content;
        });

      }

     loadFinanceList() {
             this.financeService.getAllByType('EXPENSE',this.page, this.size, 'createdDate')
                  .subscribe(res => {
                    this.financeList = res.content;
                    this.totalPages = res.totalPages;
                  });
      }

    clearForm(){
        this.searchForm.reset();
        this.reportList=[];
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

                <title>Expense Report</title>

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
