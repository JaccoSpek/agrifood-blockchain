import {Component}    from '@angular/core';
import { AppComponent } from "../../app.component";
import { GrapeAsset, Message } from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'grape-assets',
  templateUrl: 'grape-assets.component.html'
})
export class GrapeAssetsComponent extends AppComponent{
  private grapeAssets:GrapeAsset[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get created grapes
    this.chainService.get_created_grapes(this.enrolledId).then(result => {
      this.grapeAssets = result as GrapeAsset[];
      console.log(this.grapeAssets);

      if(!this.grapeAssets || (this.grapeAssets && this.grapeAssets.length == 0)){
        this.msg = {text:"No grape assets found", level:"alert-info"}
      }

    });
  }

}
