import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { EventsService } from '../../services/events.service';
import { RouterModule } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { UsersService } from '../../services/users.service';
import { UpdateProfileComponent } from '../../shared/update-profile/update-profile.component';
import { ChangePasswordComponent } from '../../shared/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-event',
  standalone: true,
     imports: [CommonModule, RouterModule, ReactiveFormsModule, UpdateProfileComponent, ChangePasswordComponent, ConfirmDialogComponent],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {
  successMessage: string = '';
    errorMessage: string = '';
 events: any[] = [];
  eventForm!: FormGroup;
   username: string = '';
    avatar: string = '';
    role: string = '';
     profile: any = {};
         showMyProfileModal = false;

  showModal = false;
  isEditMode = false;
   showProfile = false;
  selectedEventId: number | null = null;

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
    private eventsService: EventsService,
    private usersService: UsersService
  ) {}

activeMenu: string | null = null;
toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  ngOnInit() {
    this.initializeForm();
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

  initializeForm() {
    this.eventForm = this.fb.group({
      eventName: ['', Validators.required]
    });
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
    this.selectedEventId = null;
    this.eventForm.reset();
  }

  closeModal() {
    this.showModal = false;
  }

  editEvent(event: any) {
    this.showModal = true;
    this.isEditMode = true;
    this.selectedEventId = event.id;

    this.eventForm.patchValue({
      eventName: event.eventName
    });
  }

  submitEvent() {

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formData = this.eventForm.value;

    if (this.isEditMode && this.selectedEventId) {

      this.eventsService.updateEvent(this.selectedEventId, formData)
//         .subscribe(() => {
//           alert('Event Updated Successfully');
//           this.afterSave();
//         });
.subscribe({
              next: () => {

          this.successMessage = 'Event Updated Successfully';
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

      this.eventsService.createEvent(formData)
//         .subscribe(() => {
//           alert('Event Added Successfully');
//           this.afterSave();
//         });
.subscribe({
       next: () => {

         this.successMessage = 'Event Created Successfully';
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

//   deleteEvent(id: number) {
//
//     if (!confirm('Are you sure you want to delete this Event?')) {
//       return;
//     }
//
//     this.eventsService.deleteEvent(id)
//       .subscribe(() => {
//         alert('Deleted Successfully');
//         this.loadEvents();
//       });
//   }

deleteConfirmed(){

  if(!this.selectedEventId) return;

  this.eventsService.deleteEvent(this.selectedEventId)
  .subscribe({
    next:()=>{
      this.successMessage = "Event deleted successfully";
     this.loadEvents();
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
    this.loadEvents();
  }

onSearch() {
    this.page = 0; // reset page
    this.loadEvents();
  }
changePage(newPage: number) {
    this.page = newPage;
    this.loadEvents();
  }

//--Event Name Field Malayalam Type & Wait for some time before filling
autoTranslate() {
  this.eventForm.get('eventName')?.valueChanges
    .pipe(debounceTime(1000))
    .subscribe((value: string) => {
      if (value) {
        this.translateToMalayalam(value);
      }
    });
}
translateToMalayalam(text: string) {

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ml&dt=t&q=${text}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {

      const translatedText = data[0][0][0];

      this.eventForm.get('eventName')
        ?.setValue(translatedText, { emitEvent: false });

    })
    .catch(err => console.error(err));
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
