import {Component, OnInit} from '@angular/core';
import { Observable }         from 'rxjs/Rx';
import {CcRole} from "./types";
import {SharedService} from "./services/shared.service";

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  role:CcRole;

  constructor(private sharedService:SharedService) {};

  getRole():void {
    let role:CcRole = JSON.parse(this.sharedService.getValue("role")) as CcRole;
    if(role !== null){
      if(!this.role || this.role.Admin != role.Admin || this.role.Role != role.Role) {
        this.role = role;
      }
    }
  }

  ngOnInit():void {
    let timer = Observable.timer(0,1000);
    timer.subscribe(t => this.getRole());
  }
}
