import {Component, OnInit}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {Accreditation, Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'accreditations-overview',
  templateUrl: 'accreditations-overview.component.html'
})
export class AccreditationsOverviewComponent extends AppComponent implements OnInit{
  private accreditations:Accreditation[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get created accreditations
    this.chainService.get_party_accreditations(this.enrolledId).then(result => {
      this.accreditations = result as Accreditation[];
      if(!this.accreditations || (this.accreditations && this.accreditations.length == 0)) {
        this.msg = {text:"No accreditations found", level:"alert-info"}
      }
    });
  }

}
