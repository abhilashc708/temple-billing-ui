import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  OnInit,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { DonationService } from '../../services/donation.service';
import { EventsService } from '../../services/events.service';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';

@Component({
  selector: 'app-donation-report',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UpdateProfileComponent,
    ChangePasswordComponent,
  ],
  templateUrl: './donation-report.component.html',
  styleUrl: './donation-report.component.scss',
})
export class DonationReportComponent {
  showProfile = false;
  searchForm!: FormGroup;
  reportList: any[] = [];
  events: any[] = [];
  username: string = '';
  avatar: string = '';
  role: string = '';
  profile: any = {};
  showMyProfileModal = false;
  isLoading = false;
  noDataFound = false;

  @ViewChild(UpdateProfileComponent)
  updateProfilePopup!: UpdateProfileComponent;

  @ViewChild(ChangePasswordComponent)
  changePasswordPopup!: ChangePasswordComponent;

  search: any = {
    donationFromDate: [''],
    donationToDate: [''],
  };

  page = 0;
  size = 5;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService,
    private eventsService: EventsService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      paymentStatus: [''],
      paymentType: [''],
      donateFor: [''],
      receiptBookNumber: [''],

      donationFromDate: [''],
      donationToDate: [''],
    });
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

  getReport() {
    this.isLoading = true;
    this.noDataFound = false;
    const payload = Object.fromEntries(
      Object.entries(this.searchForm.value).map(([k, v]) => [
        k,
        v === '' ? null : v,
      ])
    );
    this.donationService
      .searchDonationsReport(payload)
      .subscribe((res: any) => {
        this.reportList = res;
        this.isLoading = false;
        this.noDataFound = res.length === 0;
      });
  }
  clearForm() {
    this.searchForm.reset({
      paymentStatus: '',
      paymentType: '',
      donateFor: '',
      receiptBookNumber: '',
      donationFromDate: '',
      donationToDate: '',
    });
    this.reportList = [];
    this.noDataFound = false;
  }

  refreshPage() {
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
    const printContents = document.getElementById('reportSection')?.innerHTML;

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

        <title>Donation Report</title>

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

  loadEvents() {
    this.eventsService
      .getEvents(this.page, this.size, 'createdDate')
      .subscribe((res: any) => {
        this.events = res.content;
        this.totalPages = res.totalPages;
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
  openMyProfile() {
    this.usersService.getMyProfile().subscribe((res) => {
      this.profile = res;
      this.showMyProfileModal = true;
    });
  }
  downloadReport() {
    const element = document.getElementById('reportSection');
    if (!element) return;

    // ✅ GET TODAY DATE (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    const opt = {
      margin: [0.3, 0.3, 0.5, 0.3],
      filename: `Donation_Report_${today}.pdf`, // 🔥 DYNAMIC NAME
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['css', 'legacy'] },
    };

    import('html2pdf.js').then((html2pdf: any) => {
      html2pdf.default().set(opt).from(element).save();
    });
  }
}
