import { NgModule}         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { HttpModule}       from '@angular/http';
import { FormsModule }      from '@angular/forms';

import { AppComponent }     from './app.component';
import { SharedService }    from './services/shared.service';
import { ChainService }     from './services/chain.service';
import { AppRoutingModule } from './modules/app-routing.module';

import { AuthComponent } from './components/auth.component';
import { ChaincodeIdComponent } from './components/chaincode-id.component';
import { AdminComponent } from './components/admin/admin.component';
import { AddPartyComponent } from "./components/admin/add-party.component";
import { AccreditationbodyComponent } from "./components/accreditationbody/accreditationbody.component";
import {CreateAccreditationComponent} from "./components/accreditationbody/create-accreditation.component";
import {IssueAccreditationComponent} from "./components/accreditationbody/issue-accreditation.component";
import {RevokeAccreditationComponent} from "./components/accreditationbody/revoke-accreditation.component";
import {CertificationbodyComponent} from "./components/certificationbody/certificationbody.component";
import {GrantSigningAuthorityComponent} from "./components/certificationbody/grant-signing-authority.component";
import {RevokeSigningAuthorityComponent} from "./components/certificationbody/revoke-signing-authority.component";
import {FarmComponent} from "./components/farm/farm.component";
import {CreateGrapesComponent} from "./components/farm/create-grapes.component";
import {CertifyGrapesComponent} from "./components/farm/certify-grapes.component";
import {TransferGrapesComponent} from "./components/farm/transfer-grapes.component";
import {AuditorComponent} from "./components/auditor/auditor.component";
import {AuditorRevokeAccreditationComponent} from "./components/auditor/auditor-revoke-accreditation.component";
import {AuditorRevokeSigningAuthorityComponent} from "./components/auditor/auditor-revoke-signing-authority.component";
import {AuditorRevokeSignatureComponent} from "./components/auditor/auditor-revoke-signature";
import {TraderComponent} from "./components/trader/trader.component";
import {TraderTransferGrapesComponent} from "./components/trader/trader-transfer-grapes.component";
import {PublicComponent} from "./components/public/public.component";
import {GrapeOwnerShipTrailComponent} from "./components/public/grape-ownership-trail.component";
import {GrapeSignaturesComponent} from "./components/public/grape-signatures.component";
import {SignerCertsComponent} from "./components/public/signer-certs.component";
import {AccreditationsOverviewComponent} from "./components/accreditationbody/accreditations-overview.component";

@NgModule({
  imports:      [ BrowserModule, HttpModule, FormsModule, AppRoutingModule ],
  declarations: [
    AppComponent,
    AuthComponent,
    ChaincodeIdComponent,
    AdminComponent,
    AddPartyComponent,
    AccreditationbodyComponent,
    CreateAccreditationComponent,
    IssueAccreditationComponent,
    RevokeAccreditationComponent,
    AccreditationsOverviewComponent,
    CertificationbodyComponent,
    GrantSigningAuthorityComponent,
    RevokeSigningAuthorityComponent,
    FarmComponent,
    CreateGrapesComponent,
    CertifyGrapesComponent,
    TransferGrapesComponent,
    AuditorComponent,
    AuditorRevokeAccreditationComponent,
    AuditorRevokeSigningAuthorityComponent,
    AuditorRevokeSignatureComponent,
    TraderComponent,
    TraderTransferGrapesComponent,
    PublicComponent,
    GrapeOwnerShipTrailComponent,
    GrapeSignaturesComponent,
    SignerCertsComponent
  ],
  providers:    [ SharedService, ChainService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
