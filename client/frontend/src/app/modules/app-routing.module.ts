import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from '../components/admin/admin.component';
import { AddPartyComponent } from '../components/admin/add-party.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent, children: [
    { path: 'add_party', component:AddPartyComponent }
  ]},
];

@NgModule({
  imports:  [ RouterModule.forRoot(routes) ],
  exports:  [ RouterModule ]
})
export class AppRoutingModule {}
