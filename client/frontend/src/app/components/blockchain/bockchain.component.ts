import {Component, OnDestroy, OnInit}    from '@angular/core';
import {SharedService} from "../../services/shared.service";
import {Subscription} from "rxjs/Subscription";

@Component({
  moduleId: module.id,
  selector: 'blockchain',
  templateUrl: 'blockchain.component.html'
})
export class BlockchainComponent implements OnInit, OnDestroy{
  private userID:string;
  private subscription:Subscription;

  constructor(private sharedService:SharedService) {};

  ngOnInit():void {
    this.subscription = this.sharedService.notifyObservable$.subscribe((result) => {
      if(result.hasOwnProperty('option') && result.option === 'login'){
        this.userID = result.value;
      }
    });
  }

  ngOnDestroy():void {
    this.subscription.unsubscribe();
  }
}
