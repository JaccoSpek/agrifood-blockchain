import {Component, OnInit} from '@angular/core';
import {CcRole} from "./types";
import {SharedService} from "./services/shared.service";

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  protected role:CcRole;
  protected enrolledId:string;
  protected ccid:string;

  private ready:boolean;

  constructor(private sharedService:SharedService) {};

  protected OnInitialized():void {
  }

  ngOnInit():void {
    this.ready = false;

    // get values if already set
    this.enrolledId = this.sharedService.getValue("enrolledId");
    this.role = JSON.parse(this.sharedService.getValue("role")) as CcRole;
    this.update();

    // listen for updates
    this.sharedService.notifyObservable$.subscribe(result => {
      if(result.hasOwnProperty('option') && result.option === 'enroll'){
        this.enrolledId = result.value;
        this.update();
      }
      if(result.hasOwnProperty('option') && result.option === 'role'){
        this.role = JSON.parse(result.value) as CcRole;
        this.update();
      }
    });

  }

  private update():void {
    if(!this.ready && this.role !== null  && typeof this.role !== "undefined" && this.enrolledId !== null && typeof this.enrolledId !== "undefined" ) {
      this.ready = true;
      this.OnInitialized();
    }
  }

}
