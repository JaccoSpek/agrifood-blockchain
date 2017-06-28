import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from '../components/admin/admin.component';
import { AddPartyComponent } from '../components/admin/add-party.component';
import { AccreditationbodyComponent } from '../components/accreditationbody/accreditationbody.component';
import { CreateAccreditationComponent } from '../components/accreditationbody/create-accreditation.component';
import { IssueAccreditationComponent } from '../components/accreditationbody/issue-accreditation.component';
import { RevokeAccreditationComponent } from '../components/accreditationbody/revoke-accreditation.component';
import { AccreditationsOverviewComponent } from '../components/accreditationbody/accreditations-overview.component';
import { CertificationbodyComponent } from '../components/certificationbody/certificationbody.component';
import { GrantSigningAuthorityComponent } from '../components/certificationbody/grant-signing-authority.component';
import { RevokeSigningAuthorityComponent } from '../components/certificationbody/revoke-signing-authority.component';
import { IssuedAccreditationsComponent } from '../components/certificationbody/issued-accreditations.component';
import { IssuedAuthorizationsComponent } from '../components/certificationbody/issued-authorizations.component';
import { FarmComponent } from '../components/farm/farm.component';
import { GrantedAuthorizationsComponent } from '../components/farm/granted-authorizations.component';
import { CreateGrapesComponent } from '../components/farm/create-grapes.component';
import { GrapeAssetsComponent } from '../components/farm/grape-assets.component';
import { CertifyGrapesComponent } from '../components/farm/certify-grapes.component';
import { TransferGrapesComponent } from '../components/farm/transfer-grapes.component';
import { AuditorComponent } from '../components/auditor/auditor.component';
import { AuditorRevokeAccreditationComponent } from '../components/auditor/auditor-revoke-accreditation.component';
import { AuditorRevokeSigningAuthorityComponent } from '../components/auditor/auditor-revoke-signing-authority.component';
import { AuditorRevokeSignatureComponent } from '../components/auditor/auditor-revoke-signature';
import { AuditorAccreditationsComponent } from '../components/auditor/auditor-accreditations.component';
import { AuditorAuthorizationsComponent } from '../components/auditor/auditor-authorizations.component';
import { TraderComponent } from '../components/trader/trader.component';
import { TraderTransferGrapesComponent } from '../components/trader/trader-transfer-grapes.component';
import { OwnedGrapesComponent } from '../components/trader/owned-grapes.component';
import { PublicComponent } from '../components/public/public.component';
import { GrapesOverviewComponent } from '../components/public/grapes-overview';
const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent, children: [
    { path: 'add_party', component:AddPartyComponent }
  ]},
  { path: 'ab', component: AccreditationbodyComponent, children: [
    { path: 'create_accreditation', component:CreateAccreditationComponent },
    { path: 'issue_accreditation', component:IssueAccreditationComponent },
    { path: 'revoke_accreditation', component:RevokeAccreditationComponent },
    { path: 'accreditations_overview', component:AccreditationsOverviewComponent }
  ]},
  { path: 'cb', component: CertificationbodyComponent, children: [
    { path: 'issued_accreditations', component:IssuedAccreditationsComponent },
    { path: 'grant_signing_authority', component:GrantSigningAuthorityComponent },
    { path: 'revoke_signing_authority', component:RevokeSigningAuthorityComponent },
    { path: 'issued_authorizations', component:IssuedAuthorizationsComponent }
  ]},
  { path: 'farm', component: FarmComponent, children: [
    { path: 'granted_authorizations', component:GrantedAuthorizationsComponent },
    { path: 'create_grapes', component:CreateGrapesComponent },
    { path: 'view_grapes', component:GrapeAssetsComponent },
    { path: 'certify_grapes', component:CertifyGrapesComponent },
    { path: 'transfer_grapes', component:TransferGrapesComponent }
  ]},
  { path: 'auditor', component: AuditorComponent, children:[
    { path: 'accreditations_overview', component: AuditorAccreditationsComponent },
    { path: 'revoke_accreditation', component: AuditorRevokeAccreditationComponent },
    { path: 'authorizations_overview', component: AuditorAuthorizationsComponent },
    { path: 'revoke_signing_authority', component: AuditorRevokeSigningAuthorityComponent },
    { path: 'revoke_signature', component: AuditorRevokeSignatureComponent }
  ]},
  { path: 'trader', component: TraderComponent, children:[
    { path: 'owned_grapes', component: OwnedGrapesComponent },
    { path: 'transfer_grapes', component: TraderTransferGrapesComponent }
  ]},
  { path: 'public', component: PublicComponent, children:[
    { path: 'grapes', component: GrapesOverviewComponent }
  ]}
];

@NgModule({
  imports:  [ RouterModule.forRoot(routes) ],
  exports:  [ RouterModule ]
})
export class AppRoutingModule {}
