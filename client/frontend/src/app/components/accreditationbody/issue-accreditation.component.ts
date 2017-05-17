import {Component, OnInit}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'issue-accreditation',
  templateUrl: 'issue-accreditation.component.html'
})
export class IssueAccreditationComponent extends AppComponent implements OnInit {
  cert_bodies:string[];

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

    // cet issued accreditations
    let id:string = this.sharedSrv.getValue("enrolledId");
    this.chainService.get_party_accreditations(id).then(result => {
      console.log(result);
    });
  }
}
