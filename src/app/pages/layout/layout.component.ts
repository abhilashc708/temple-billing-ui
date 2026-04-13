import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // ✅ Import MatSnackBar
import { MatSnackBarModule } from '@angular/material/snack-bar'; // ✅ Import Module
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../services/layout.service';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    UpdateProfileComponent,
    ChangePasswordComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  username: string = '';
  avatar: string = '';
  role: string = '';
  dashboardData: any = {};
  showProfile = false;
  profile: any = {};
  showMyProfileModal = false;
  date: string = '';
  time: string = '';
  ampm: string = '';

  @ViewChild(UpdateProfileComponent)
  updateProfilePopup!: UpdateProfileComponent;

  @ViewChild(ChangePasswordComponent)
  changePasswordPopup!: ChangePasswordComponent;

  constructor(
    private layoutService: LayoutService,
    private usersService: UsersService,
    private router: Router
  ) {}
  summary: any;
  showQuickMenu = false;

  ngOnInit() {
    this.loadDashboard();
    this.username = localStorage.getItem('name') || 'User';
    this.avatar = localStorage.getItem('avatar') || 'U';
    this.role = localStorage.getItem('role') || 'NULL';
   this.updateClock();
     setInterval(() => {
       this.updateClock();
     }, 1000);
  }


updateClock() {
  const now = new Date();

  // 📅 DATE
  this.date = now.toLocaleDateString('en-GB'); // dd/mm/yyyy

  // ⏰ TIME WITH SECONDS
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  this.ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12

  this.time = `${hours}:${minutes}:${seconds}`;
}

  getFirstName(username: string): string {
    if (!username) return '';
    const firstName = username.split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }

  toggleQuickMenu(event: Event) {
    event.stopPropagation();
    this.showQuickMenu = !this.showQuickMenu;
  }

  closeQuickMenu() {
    this.showQuickMenu = false;
  }

  loadDashboard() {
    this.layoutService.getDashboardSummary().subscribe((res: any) => {
      this.dashboardData = res;
    });
  }
  activeMenu: string | null = null;

  @ViewChild('menuContainer') menuContainer!: ElementRef;

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close navbar menu
    if (!this.menuContainer?.nativeElement.contains(target)) {
      this.activeMenu = null;
    }

    // Close quick add menu
    if (!target.closest('.quick-add')) {
      this.showQuickMenu = false;
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
