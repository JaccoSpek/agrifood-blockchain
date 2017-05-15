import { Component, OnInit }    from '@angular/core';
import { Observable }         from 'rxjs/Rx';

import { CcRole } from '../../types';

import { SharedService } from '../../services/shared.service';

@Component({
  moduleId: module.id,
  selector: 'admin',
  templateUrl: 'admin.component.html'
})
export class AdminComponent implements OnInit {
  role:CcRole;

  constructor(private sharedService:SharedService) {};

  getRole():void {
    if(!this.role){
      let role:CcRole = JSON.parse(this.sharedService.getValue("role")) as CcRole;
      if(role !== null){
        this.role = role;
      }
    }
  }

  ngOnInit():void {
    let timer = Observable.timer(0,1000);
    timer.subscribe(t => this.getRole());
  }
}
