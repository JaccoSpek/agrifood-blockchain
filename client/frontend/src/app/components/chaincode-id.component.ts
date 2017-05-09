import { Component, OnInit }    from '@angular/core';
import { Observable }         from 'rxjs/Rx';

import { Message } from '../types';

import { SharedService }   from '../services/shared.service';
import { ChainService }   from '../services/chain.service';

@Component({
  moduleId: module.id,
  selector: 'ccid',
  templateUrl: 'chaincode-id.component.html'
})
export class ChaincodeIdComponent implements OnInit {
  private enrolledId:string;
  private ccId:string;
  private newCcId:string = "";
  private msg:Message;

  constructor(private sharedService:SharedService, private chainService:ChainService) {};

  getData():void {
    this.enrolledId = this.sharedService.getValue("enrolledId");
    this.ccId = this.sharedService.getValue("chaincodeID");
    if(!this.ccId) {
      this.chainService.get_ccid().then(result => {
        if(result != "false") {
          this.sharedService.setKey("chaincodeID",result);
        }
      });
    }
  }

  ngOnInit(): void {
    let timer = Observable.timer(0,1000);
    timer.subscribe(t => this.getData());
  }

  update():void {
    if(this.newCcId != null){
      this.sharedService.setKey("chaincodeID",this.newCcId);
    }
  }

  deploy():void {
    console.log("deploy contract..");
    this.msg = { level: "alert-info", text: "Deploying contract..."};
    this.chainService.deploy().then((result:string)=>{
      console.log("Successfully deployed contract: %s",result);
      this.sharedService.setKey("chaincodeID",result);
      this.ccId = result;
      this.msg = null;
    }).catch(() => {
      console.log("Failed to deploy");
      this.msg = { level: "alert-danger", text: "Failed to deploy"};
    });
  }
}
