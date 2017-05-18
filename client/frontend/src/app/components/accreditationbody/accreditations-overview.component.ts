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

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  ngOnInit():void {
    super.ngOnInit();

    // get created accreditations
    let id:string = this.sharedSrv.getValue("enrolledId");
    this.chainService.get_party_accreditations(id).then(result => {
      this.accreditations = result as Accreditation[];
    });
  }
}
