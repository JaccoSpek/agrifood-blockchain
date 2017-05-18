import {Component, OnInit}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";
import {Accreditation, Message} from '../../types';

@Component({
  moduleId: module.id,
  selector: 'issue-accreditation',
  templateUrl: 'issue-accreditation.component.html'
})
export class IssueAccreditationComponent extends AppComponent implements OnInit {
  private cert_bodies:string[];
  private accreditations:Accreditation[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  ngOnInit():void {
    super.ngOnInit();

    // get certification bodies
    this.chainService.get_role_parties("CertificationBody").then(result =>{
      this.cert_bodies = result as string[];
      console.log(this.cert_bodies);
    });

    // get created accreditations
    let id:string = this.sharedSrv.getValue("enrolledId");
    this.chainService.get_party_accreditations(id).then(result => {
      this.accreditations = result as Accreditation[];
      console.log(this.accreditations);
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
