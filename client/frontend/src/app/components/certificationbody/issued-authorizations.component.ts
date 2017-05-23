import {Component}    from '@angular/core';
import { AppComponent } from "../../app.component";
import { Authorization, Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'issued-authorizations',
  templateUrl: 'issued-authorizations.component.html'
})
export class IssuedAuthorizationsComponent extends AppComponent{
  private authorizations:Authorization[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get issued authorizations
    this.chainService.get_issued_authorizations(this.enrolledId).then(result => {
      this.authorizations = result as Authorization[];
      if(!this.authorizations || (this.authorizations && this.authorizations.length == 0)) {
        this.msg = {text:"No authorizations found", level:"alert-info"}
      }
    });
  }

}
