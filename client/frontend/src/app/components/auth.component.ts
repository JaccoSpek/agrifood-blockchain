import { Component, OnInit }    from '@angular/core';
import { Observable }           from 'rxjs/Rx';

import { Message,CcRole } from '../types';

import { SharedService } from '../services/shared.service';
import { ChainService }   from '../services/chain.service';

@Component({
  moduleId: module.id,
  selector: 'auth',
  templateUrl: 'auth.component.html'
})
export class AuthComponent implements OnInit {
  enrolledId:string;
  msg:Message;
  role:CcRole;

  constructor(private sharedService:SharedService, private chainService:ChainService) {};

  ngOnInit(): void {
    this.chainService.get_enrollment().then(result => {
      if(result != "false"){
        console.log("Logged in as:",result);
        this.enrolledId = result;
        this.sharedService.setKey("enrolledId",result);

        let timer = Observable.timer(0,1000);
        timer.subscribe(t => this.getData());
      } else {
        console.log("Currently not enrolled.");
      }
    });
  }

  private getData():void {
    if(this.role == null){
      this.role = this.sharedService.getValue("role");
      console.log(this.role);
    }
  }

  private login(enrollId: string, enrollSecret: string): void {
    console.log("login", enrollId, enrollSecret);

    if(typeof enrollId != "undefined" && typeof enrollSecret != "undefined"){
      this.msg = { text: "Logging in...", level:"alert-info"};
      // login
      this.chainService.login(enrollId,enrollSecret).then((result:any) => {
        this.msg = null;
        console.log("Login result:",result);
        this.enrolledId = result;
        this.sharedService.setKey("enrolledId",result);
      }).catch(() => {
        this.msg = { text: "Failed to login", level:"alert-danger"};
      });
    } else {
      this.msg = { text: "Please provide login details", level:"alert-warning"};
    }
  }

  private logout():void {
    console.log("Logout");

    this.chainService.logout().then((result:any) => {
      console.log("Logout successful");
      this.enrolledId = null;
      this.sharedService.setKey("enrolledId",null);
    }).catch(() => {
      this.msg = { text: "Failed to logout", level:"alert-danger"};
    });
  }
}
