import { Routes, provideRouter} from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guard/auth.guard';
import { BookingComponent } from './pages/booking/booking.component';
import { OfferingComponent } from './pages/offering/offering.component';
import { GodComponent } from './pages/god/god.component';
import { EventComponent } from './pages/event/event.component';
import { DonationComponent } from './pages/donation/donation.component';
import { FinanceManagerComponent } from './pages/finance-manager/finance-manager.component';
import { IncomeEntryComponent } from './pages/income-entry/income-entry.component';
import { ExpenseEntryComponent } from './pages/expense-entry/expense-entry.component';
import { BookingReportComponent } from './pages/booking-report/booking-report.component';
import { DonationReportComponent } from './pages/donation-report/donation-report.component';
import { IncomeReportComponent } from './pages/income-report/income-report.component';
import { ExpenseReportComponent } from './pages/expense-report/expense-report.component';
import { UsersComponent } from './pages/users/users.component';
import { IncomeSummaryComponent } from './pages/income-summary/income-summary.component';


export const routes: Routes = [
  {
      path:'',
      redirectTo: 'login',
      pathMatch:'full'
    },
    {
      path:'login',
      component:LoginComponent
    },
  {
      path:'',
      component:LayoutComponent,
      children:[
                 {
                    path:'dashboard',
                    component: DashboardComponent,
                    canActivate: [authGuard]
                  },
                ]
    },
 {
         path:'booking',
         component: BookingComponent,
         canActivate: [authGuard]
    },
  {
           path:'offering',
           component: OfferingComponent,
           canActivate: [authGuard]
      },
    {
      path:'god',
               component: GodComponent,
               canActivate: [authGuard]
          },
        {
                       path:'event',
                       component: EventComponent,
                       canActivate: [authGuard]
                  },
                {
                  path:'donation',
                  component: DonationComponent,
                  canActivate: [authGuard]
                },
               {
                  path:'finance-manager',
                   component: FinanceManagerComponent,
                   canActivate: [authGuard]
               },
               {
                 path:'income-entry',
                 component: IncomeEntryComponent,
                 canActivate: [authGuard]
             },
           {
               path:'expense-entry',
               component: ExpenseEntryComponent,
               canActivate: [authGuard]
                        },

           {
             path:'booking-report',
             component: BookingReportComponent,
             canActivate: [authGuard]
          },
        {
             path:'donation-report',
            component: DonationReportComponent,
            canActivate: [authGuard]
                  },
                {
          path:'income-report',
          component: IncomeReportComponent,
          canActivate: [authGuard]
                          },
                        {
            path:'expense-report',
            component: ExpenseReportComponent,
             canActivate: [authGuard]
                                  },
            {
              path:'users',
               component: UsersComponent,
              canActivate: [authGuard]
              },
            {
              path:'income-summary',
              component: IncomeSummaryComponent,
              canActivate: [authGuard]
            }

  ];
export const appRouter = provideRouter(routes);
