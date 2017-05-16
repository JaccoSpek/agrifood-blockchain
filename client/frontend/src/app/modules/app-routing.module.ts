import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from '../components/admin/admin.component';
import { AddPartyComponent } from '../components/admin/add-party.component';
import { AccreditationbodyComponent } from '../components/accreditationbody/accreditationbody.component';
import { CreateAccreditationComponent } from '../components/accreditationbody/create-accreditation.component';
import { IssueAccreditationComponent } from '../components/accreditationbody/issue-accreditation.component';
import { RevokeAccreditationComponent } from '../components/accreditationbody/revoke-accreditation.component';
import { CertificationbodyComponent } from '../components/certificationbody/certificationbody.component';
import { GrantSigningAuthorityComponent } from '../components/certificationbody/grant-signing-authority.component';
import { RevokeSigningAuthorityComponent } from '../components/certificationbody/revoke-signing-authority.component';
import { FarmComponent } from '../components/farm/farm.component';
import { CreateGrapesComponent } from '../components/farm/create-grapes.component';
import { CertifyGrapesComponent } from '../components/farm/certify-grapes.component';
import { TransferGrapesComponent } from '../components/farm/transfer-grapes.component';
import { AuditorComponent } from '../components/auditor/auditor.component';
import { AuditorRevokeAccreditationComponent } from '../components/auditor/auditor-revoke-accreditation.component';
import { AuditorRevokeSigningAuthorityComponent } from '../components/auditor/auditor-revoke-signing-authority.component';
import { AuditorRevokeSignatureComponent } from '../components/auditor/auditor-revoke-signature';
import { TraderComponent } from '../components/trader/trader.component';
import { TraderTransferGrapesComponent } from '../components/trader/trader-transfer-grapes.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent, children: [
    { path: 'add_party', component:AddPartyComponent }
  ]},
  { path: 'ab', component: AccreditationbodyComponent, children: [
    { path: 'create_accreditation', component:CreateAccreditationComponent },
    { path: 'issue_accreditation', component:IssueAccreditationComponent },
    { path: 'revoke_accreditation', component:RevokeAccreditationComponent }
  ]},
  { path: 'cb', component: CertificationbodyComponent, children: [
    { path: 'grant_signing_authority', component:GrantSigningAuthorityComponent },
    { path: 'revoke_signing_authority', component:RevokeSigningAuthorityComponent }
  ]},
  { path: 'farm', component: FarmComponent, children: [
    { path: 'create_grapes', component:CreateGrapesComponent },
    { path: 'certify_grapes', component:CertifyGrapesComponent },
    { path: 'transfer_grapes', component:TransferGrapesComponent }
  ]},
  { path: 'auditor', component: AuditorComponent, children:[
    { path: 'revoke_accreditation', component: AuditorRevokeAccreditationComponent },
    { path: 'revoke_signing_authority', component: AuditorRevokeSigningAuthorityComponent },
    { path: 'revoke_signature', component: AuditorRevokeSignatureComponent }
  ]},
  { path: 'trader', component: TraderComponent, children:[
    { path: 'transfer_grapes', component: TraderTransferGrapesComponent }
  ]}
];

@NgModule({
  imports:  [ RouterModule.forRoot(routes) ],
  exports:  [ RouterModule ]
})
export class AppRoutingModule {}
