import {Component, OnInit}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {ChainService} from "../../services/chain.service";
import {SharedService} from "../../services/shared.service";
import {Message} from "../../types";

@Component({
  moduleId: module.id,
  selector: 'create-accreditation',
  templateUrl: 'create-accreditation.component.html'
})
export class CreateAccreditationComponent extends AppComponent implements OnInit{
  private created_date:string;
  private expiration_date:string;
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  ngOnInit():void {
    super.ngOnInit();
    let now:Date = new Date();
    this.created_date = now.toISOString();
    now.setFullYear(now.getFullYear()+1);
    this.expiration_date = now.toISOString();
  }

  createAccreditation(id:string,descr:string,created:string,expires:string):void {
    console.log("Create accreditation..");
    this.msg = {text:"Create accreditation..",level:"alert-info"};
    this.chainService.add_signing_accreditation(id,descr,created,expires).then(result => {
      console.log(result);
      this.msg = {text:result,level:"alert-success"};
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }
}
