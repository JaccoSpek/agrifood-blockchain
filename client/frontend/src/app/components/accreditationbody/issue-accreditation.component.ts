import {Component }    from '@angular/core';
import { AppComponent } from "../../app.component";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";
import {Accreditation, Message} from '../../types';

@Component({
  moduleId: module.id,
  selector: 'issue-accreditation',
  templateUrl: 'issue-accreditation.component.html'
})
export class IssueAccreditationComponent extends AppComponent {
  private cert_bodies:string[];
  private accreditations:Accreditation[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get certification bodies
    this.chainService.get_role_parties("CertificationBody").then(result =>{
      this.cert_bodies = result as string[];
    });

    // get created accreditations
    this.chainService.get_party_accreditations(this.enrolledId).then(result => {
      let accreditations:Accreditation[] = result as Accreditation[];

      this.accreditations = accreditations.filter(
        accr => accr.Revoked == false && !accr.CertificationBody
      );

      if(!this.accreditations || (this.accreditations && this.accreditations.length == 0)) {
        this.msg = {text:"No accreditations found", level:"alert-info"}
      }
    });
  }

  issue_accreditation(accreditation:string,cb:string):void {
    this.msg = {text:"Issue accreditation..",level:"alert-info"};
    this.chainService.issue_accreditation(accreditation,cb).then(result => {
      console.log(result);
      this.msg = {text:result,level:"alert-success"};
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }
}
