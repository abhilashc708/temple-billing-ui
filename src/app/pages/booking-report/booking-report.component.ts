import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { OfferingService } from '../../services/offering.service';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';

@Component({
  selector: 'app-booking-report',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent],
  templateUrl: './booking-report.component.html',
  styleUrl: './booking-report.component.scss'
})
export class BookingReportComponent {
  showProfile = false;
  role: string = '';
username: string = '';
  avatar: string = '';
searchForm!: FormGroup;
reportList: any[] = [];
receipts: any[] = [];
 offerings: any[] = [];
  profile: any = {};
  showMyProfileModal = false;

  @ViewChild(UpdateProfileComponent)
    updateProfilePopup!: UpdateProfileComponent;

  @ViewChild(ChangePasswordComponent)
  changePasswordPopup!: ChangePasswordComponent;

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

search: any = {
    bookingFromDate: [''],
    bookingToDate: [''],
    vazhipaduFromDate: [''],
    vazhipaduToDate: ['']
  };
constructor(private bookingService: BookingService,
  private offeringService: OfferingService,
  private usersService: UsersService,
  private fb:FormBuilder,
  private router: Router){}

ngOnInit(){
  this.searchForm = this.fb.group({
    vazhipadu:[''],
    birthStar:[''],
    vazhipaduFromDate:[''],
    vazhipaduToDate:[''],
    bookingFromDate:[''],
    bookingToDate:[''],
    paymentStatus:[''],
    paymentType:['']
  });
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

loadOfferings() {
  this.offeringService.getOfferingsByStatus().subscribe(data => {
    this.offerings = data;
  });
}

getReport(){
  const payload = Object.fromEntries(
    Object.entries(this.searchForm.value)
      .map(([k,v]) => [k, v === '' ? null : v])
  );
  this.bookingService.searchBookings(payload).subscribe((res:any)=>{
    this.reportList = res.content;
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

    return this.reportList.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.amount);
    }, 0);

  }

printReport() {

  const printContents = document.getElementById('reportSection')?.innerHTML;
    if (!printContents) return;

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
        <title>Booking Report</title>

        <style>

          body{
            font-family: Arial;
            padding:20px;
          }

          table{
            width:100%;
            border-collapse:collapse;
          }

          th,td{
            border:1px solid black;
            padding:6px;
            font-size:13px;
            text-align:left;
          }

          th{
            background:#f2f2f2;
          }

          .temple-header{
            text-align:center;
            margin-bottom:10px;
          }

          .filter-row{
            margin:10px 0;
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

}
