import {Component, OnInit}    from '@angular/core';
import {WalletService}        from "../../services/wallet.service";
import { Observable }         from 'rxjs/Rx';
@Component({
  moduleId: module.id,
  selector: 'blockchain',
  templateUrl: 'blockchain.component.html'
})
export class BlockchainComponent implements OnInit{
  private userID:string;

  constructor(private walletService:WalletService) {};

  ngOnInit():void {
    let timer = Observable.timer(0,1000);
    timer.subscribe(() => {
      this.walletService.getStatus()
        .then(result => {
          this.userID = result;
        })
        .catch(() => {
          this.userID = null;
        });
    });
  }

}
