import {Component, OnInit}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {Accreditation, Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'auditor-accreditations',
  templateUrl: 'auditor-accreditations.component.html'
})
export class AuditorAccreditationsComponent extends AppComponent implements OnInit{
  private accreditations:Accreditation[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get created accreditations
    this.chainService.get_accreditations().then(result => {
      this.accreditations = result as Accreditation[];
      if(!this.accreditations || (this.accreditations && this.accreditations.length == 0)) {
        this.msg = {text:"No accreditations found", level:"alert-info"}
      }
    });
  }

  revoke_accreditation(accreditationID:string):void {
    let now = new Date();

    this.msg = {text:"Revoking accreditation..",level:"alert-info"};
    this.chainService.revoke_accreditation(accreditationID,now.toISOString()).then(result => {
      this.msg = {text:result,level:"alert-success"};
      this.OnInitialized();
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }

}
