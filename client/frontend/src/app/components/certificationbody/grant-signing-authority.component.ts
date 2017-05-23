import { Component }    from '@angular/core';
import { AppComponent } from "../../app.component";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";
import {Accreditation, Message} from "../../types";

@Component({
  moduleId: module.id,
  selector: 'grant-signing-authority',
  templateUrl: 'grant-signing-authority.component.html'
})
export class GrantSigningAuthorityComponent extends AppComponent {
  private farms:string[];
  private accreditations:Accreditation[];
  private expiration_date:string;
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get certification bodies
    this.chainService.get_role_parties("Farm").then(result =>{
      this.farms = result as string[];
    });

    // get issued accreditations
    this.chainService.get_issued_accreditations(this.enrolledId).then(result => {
      let accreditations:Accreditation[] = result as Accreditation[];

      this.accreditations = accreditations.filter(
        accr => accr.Revoked == false
      );

      if(!this.accreditations || (this.accreditations && this.accreditations.length == 0)) {
        this.msg = {text:"No accreditations found", level:"alert-info"}
      }
    });

    // set expiration date
    this.expiration_date = new Date().toISOString();
  }

  grant_signing_authority(accreditation:string,farm:string,expiration_date:string):void {
    this.msg = {text:"Grant signing authority..",level:"alert-info"};
    this.chainService.grant_signing_authority(accreditation,farm,expiration_date).then(result => {
      console.log(result);
      this.msg = {text:result,level:"alert-success"};
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }

}
