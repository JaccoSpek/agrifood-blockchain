import { Component, OnInit }    from '@angular/core';

import { Message } from '../../types';

import { SharedService }   from '../../services/shared.service';
import { ChainService }   from '../../services/chain.service';
import {Subscription} from "rxjs/Subscription";

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
  private subscription:Subscription;

  constructor(private sharedService:SharedService, private chainService:ChainService) {};

  ngOnInit(): void {
    if(!this.ccId) {
      this.chainService.get_ccid().then(result => {
        if(result != "false") {
          this.ccId = result;
          this.sharedService.setKey("chaincodeID",result);
          this.sharedService.notifyOther({option: 'ccid',value: result});
        }
      });
    }

    this.subscription = this.sharedService.notifyObservable$.subscribe((result) => {
      if(result.hasOwnProperty('option') && result.option === 'enroll'){
        this.enrolledId = result.value;
      }
    });

  }

  update():void {
    if(this.newCcId != null){
      this.chainService.set_ccid(this.newCcId).then((result:string) => {
        this.sharedService.notifyOther({option: 'ccid',value: this.newCcId});
        this.sharedService.setKey("chaincodeID",this.newCcId);
        this.ccId = this.newCcId;
      });
    }
  }

  deploy():void {
    console.log("deploy contract..");
    this.msg = { level: "alert-info", text: "Deploying contract..."};
    this.chainService.deploy().then((result:string)=>{
      console.log("Successfully deployed contract: %s",result);
      this.sharedService.setKey("chaincodeID",result);
      this.sharedService.notifyOther({option: 'ccid',value: result})
      this.ccId = result;
      this.msg = null;
    }).catch(() => {
      console.log("Failed to deploy");
      this.msg = { level: "alert-danger", text: "Failed to deploy"};
    });
  }
}
