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
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get traders
    this.chainService.get_role_parties("Trader").then(result => {
      this.traders = result as string[];
      console.log(this.traders);
    });

    // get grapes owned by party
    this.chainService.get_own_grapes().then(result => {
      this.grapeAssets = result as GrapeAsset[];
      console.log(this.grapeAssets);
    });
  }
}
