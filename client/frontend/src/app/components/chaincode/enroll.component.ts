import { Component, OnInit }    from '@angular/core';
import { Observable }         from 'rxjs/Rx';

import { Message,CcRole } from '../../types';

import { SharedService } from '../../services/shared.service';
import { ChainService }   from '../../services/chain.service';

@Component({
  moduleId: module.id,
  selector: 'enroll',
  templateUrl: 'enroll.component.html'
})
export class EnrollComponent implements OnInit {
  enrolledId:string;
  msg:Message;
  role:CcRole;

  constructor(private sharedService:SharedService, private chainService:ChainService) {};

  getRole():void {
    let ccID:string = this.sharedService.getValue("chaincodeID");
    if(this.enrolledId && ccID){
      this.chainService.get_caller_role().then(result => {
        this.role = result as CcRole;
        this.sharedService.setKey("role",JSON.stringify(this.role));
      });
    }
  }

  ngOnInit(): void {
    this.chainService.get_enrollment().then(result => {
      if(result != "false"){
        console.log("Enrolled in as:",result);
        this.enrolledId = result;
        this.sharedService.setKey("enrolledId",result);
      } else {
        console.log("Currently not enrolled.");
      }
    });

    let timer = Observable.timer(0,1000);
    timer.subscribe(t => this.getRole());
  }

  private enroll(enrollId: string, enrollSecret: string): void {
    console.log("enroll", enrollId, enrollSecret);

    if(typeof enrollId != "undefined" && typeof enrollSecret != "undefined"){
      this.msg = { text: "Enrolling...", level:"alert-info"};
      // login
      this.chainService.enroll(enrollId,enrollSecret).then((result:any) => {
        this.msg = null;
        console.log("Enrollment result:",result);
        this.enrolledId = result;
        this.sharedService.setKey("enrolledId",result);
      }).catch(() => {
        this.msg = { text: "Failed to enroll", level:"alert-danger"};
      });
    } else {
      this.msg = { text: "Please provide enrollment details", level:"alert-warning"};
    }
  }

  private unenroll():void {
    console.log("Unenroll");

    this.chainService.unenroll().then((result:any) => {
      console.log("Unenrollment successful");
      this.enrolledId = null;
      this.sharedService.setKey("enrolledId",null);
      this.sharedService.setKey("role",null);
    }).catch(() => {
      this.msg = { text: "Failed to unenroll", level:"alert-danger"};
    });
  }
}
