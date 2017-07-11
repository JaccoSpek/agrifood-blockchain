import { Component, OnInit }    from '@angular/core';

import { Message,CcRole } from '../../types';

import { SharedService } from '../../services/shared.service';
import { ChainService }   from '../../services/chain.service';
import {Subscription} from "rxjs/Subscription";
import {WalletService} from "../../services/wallet.service";

@Component({
  moduleId: module.id,
  selector: 'enroll',
  templateUrl: 'enroll.component.html'
})
export class EnrollComponent implements OnInit {
  private enrolledId:string;
  private identities:string[];
  private ccid:string;
  private msg:Message;
  private role:CcRole;
  private subscription:Subscription;

  constructor(private sharedService:SharedService, private chainService:ChainService, private walletService:WalletService) {};

  ngOnInit(): void {
    this.chainService.get_enrollment().then(result => {
      if(result != "false"){
        console.log("Enrolled in as:",result);
        this.enrolledId = result;
        this.sharedService.setKey("enrolledId",result);
        this.sharedService.notifyOther({option: 'enroll',value: result});
      } else {
        console.log("Currently not enrolled.");
      }
    });

    // get identities registerred to this user
    this.walletService.getIdentities().then(result=>{
      this.identities = result as string[];
    });

    this.subscription = this.sharedService.notifyObservable$.subscribe(result => {
      if(result.hasOwnProperty('option') && result.option === 'enroll'){
        this.enrolledId = result.value;
        this.getRole();
      }
      if(result.hasOwnProperty('option') && result.option === 'ccid'){
        this.ccid = result.value;
        this.getRole();
      }
    });
  }

  getRole():void {
    if(this.enrolledId && this.ccid){
      this.chainService.get_caller_role().then(result => {
        this.role = result as CcRole;
        this.sharedService.setKey("role",JSON.stringify(this.role));
        this.sharedService.notifyOther({option: 'role', value: JSON.stringify(this.role) });
      });
    }
  }

  private enroll(enrollId: string, enrollSecret: string): void {
    console.log("enroll", enrollId, enrollSecret);

    if(typeof enrollId != "undefined" && typeof enrollSecret != "undefined"){
      this.msg = { text: "Enrolling...", level:"alert-info"};

      // enroll
      this.chainService.enroll(enrollId,enrollSecret).then((result:any) => {
        this.msg = null;
        console.log("Enrollment result:",result);
        this.enrolledId = result;
        this.sharedService.setKey("enrolledId",result);
        this.sharedService.notifyOther({option: 'enroll',value: result});
      }).catch(() => {
        this.msg = { text: "Failed to enroll", level:"alert-danger"};
      });
    } else {
      this.msg = { text: "Please provide enrollment details", level:"alert-warning"};
    }
  }

  private enrollKnownID(enrollId:string):void {
    console.log("enroll",enrollId);

    if(typeof enrollId != "undefined"){
      this.msg = { text: "Enrolling...", level:"alert-info"};
      // enroll
      this.chainService.enroll(enrollId,"").then((result:any) => {
        this.msg = null;
        console.log("Enrollment result:",result);
        this.enrolledId = result;
        this.sharedService.setKey("enrolledId",result);
        this.sharedService.notifyOther({option: 'enroll',value: result});
      }).catch(() => {
        this.msg = { text: "Failed to enroll", level:"alert-danger"};
      });
    } else {
      this.msg = { text: "Please select an identity", level:"alert-warning"};
    }

  }

  private unenroll():void {
    console.log("Unenroll");

    this.chainService.unenroll().then(() => {
      console.log("Unenrollment successful");
      this.enrolledId = null;
      this.sharedService.setKey("enrolledId",null);
      this.sharedService.setKey("role",null);
      this.sharedService.notifyOther({option: 'enroll',value: null});
      this.sharedService.notifyOther({option: 'role',value: null});

      this.walletService.getIdentities().then(result=>{
        this.identities = result as string[];
      });
    }).catch(() => {
      this.msg = { text: "Failed to unenroll", level:"alert-danger"};
    });
  }
}
