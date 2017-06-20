import { Component }    from '@angular/core';
import { AppComponent } from "../../app.component";
import {GrapeAsset, Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'transfer-grapes',
  templateUrl: 'transfer-grapes.component.html'
})
export class TransferGrapesComponent extends AppComponent {
  private traders:string[];
  private grapeAssets:GrapeAsset[];
  private timestamp:string;
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get traders
    this.chainService.get_role_parties("Trader").then(result => {
      this.traders = result as string[];
    });

    // get grapes owned by party
    this.chainService.get_own_grapes().then(result => {
      this.grapeAssets = result as GrapeAsset[];
    });

    // set current timestamp
    let now:Date = new Date();
    this.timestamp = now.toISOString();
  }

  transfer_asset(grape_asset_UUID:string,trader_ID:string,timestamp:string):void {
    console.log("Transfer grapes %s to %s at %s",grape_asset_UUID,trader_ID,timestamp);
    this.msg = {text:"Transfer grape asset..",level:"alert-info"};
    this.chainService.transfer_grapes(grape_asset_UUID,trader_ID,timestamp).then(result => {
      console.log(result);
      this.msg = {text:result,level:"alert-success"};
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }
}
