import { Component, OnInit }    from '@angular/core';
import {ChainService} from "../../services/chain.service";
import { SharedService } from '../../services/shared.service';
import {CcRole, Message} from "../../types";
import {AppComponent} from "../../app.component";

@Component({
  moduleId: module.id,
  selector: 'add-party',
  templateUrl: 'add-party.component.html'
})
export class AddPartyComponent extends AppComponent implements OnInit{
  private roles:string[];
  private msg:Message;

  constructor(private sharedServ:SharedService,private chainService:ChainService) {
    super(sharedServ);
  };

  ngOnInit():void {
    super.ngOnInit();
    let role:CcRole = JSON.parse(this.sharedServ.getValue("role")) as CcRole;
    if(role != null) {
      this.chainService.get_roles().then(result => {
        this.roles = result;
      });
    }
  }

  private addUserRole(user:string, role:string):void {
    console.log("add user %s (%s)",user,role);
    this.msg = {text:"Adding user..",level:"alert-info"} as Message;
    this.chainService.add_party(user,role).then(result => {
      this.msg = {text:result,level:"alert-success"} as Message;
    }).catch(reason => {
      this.msg = {text:reason,level:"alert-danger"} as Message;
    });
  }
}
