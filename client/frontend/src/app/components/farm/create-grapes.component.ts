import { Component }    from '@angular/core';
import { AppComponent } from "../../app.component";
import {Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'create-grapes',
  templateUrl: 'create-grapes.component.html'
})
export class CreateGrapesComponent extends AppComponent {
  private created_date:string;
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    let now:Date = new Date();
    this.created_date = now.toISOString();
  }

  createGrapes(uuid:string,timestamp:string):void {
    console.log("create grapes");
    this.msg = {text:"Create grapes..",level:"alert-info"};
    this.chainService.create_grapes(uuid,timestamp).then(result => {
      console.log(result);
      this.msg = {text:result,level:"alert-success"};
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }
}
