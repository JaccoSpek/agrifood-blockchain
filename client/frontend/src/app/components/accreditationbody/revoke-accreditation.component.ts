import {Component}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {Accreditation, Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'revoke-accreditation',
  templateUrl: 'revoke-accreditation.component.html'
})
export class RevokeAccreditationComponent extends AppComponent {
  private accreditations:Accreditation[];
  private revocation_timestamp:string;
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    let now:Date = new Date();
    this.revocation_timestamp = now.toISOString();

    // get created accreditations
    this.chainService.get_party_accreditations(this.enrolledId).then(result => {
      let accreditations:Accreditation[] = result as Accreditation[];

      this.accreditations = accreditations.filter(
        accr => accr.Revoked == false
      );

      if(!this.accreditations || (this.accreditations && this.accreditations.length == 0)) {
        this.msg = {text:"No accreditations found", level:"alert-info"}
      }
    });
  }

  revoke_accreditation(accreditationID:string,timestamp:string):void {
    this.msg = {text:"Revoking accreditation..",level:"alert-info"};
    this.chainService.revoke_accreditation(accreditationID,timestamp).then(result => {
      console.log(result);
      this.msg = {text:result,level:"alert-success"};
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }
}
