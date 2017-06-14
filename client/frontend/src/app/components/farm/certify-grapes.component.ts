import { Component }    from '@angular/core';
import { AppComponent } from "../../app.component";
import {Accreditation, Authorization, GrapeAsset, Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'certify-grapes',
  templateUrl: 'certify-grapes.component.html'
})
export class CertifyGrapesComponent extends AppComponent {
  private grapeAssets:GrapeAsset[];
  private authorizations:Authorization[];
  private timestamp:string;
  private msgs:Message[];

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
    this.msgs = [];
  };

  OnInitialized():void {
    // get created grapes
    this.chainService.get_created_grapes(this.enrolledId).then(result => {
      this.grapeAssets = result as GrapeAsset[];


      if(!this.grapeAssets || (this.grapeAssets && this.grapeAssets.length == 0)){
        this.msgs.push({text:"No grape assets found", level:"alert-info"});
      }

    });

    // get granted authorizations
    this.chainService.get_granted_authorizations(this.enrolledId).then(result => {
      this.authorizations = result as Authorization[];

      if(!this.authorizations || (this.authorizations && this.authorizations.length == 0)) {
        this.msgs.push({text:"No authorizations found", level:"alert-info"});
      }

    });

    // set current timestamp
    let now:Date = new Date();
    this.timestamp = now.toISOString();
  }

  certify_asset(grape_asset_UUID:string,accreditation_ID:string,timestamp:string):void {
    console.log("certify %s with %s at %s",grape_asset_UUID,accreditation_ID,timestamp);
    this.msgs.push({text:"Certify grape asset..",level:"alert-info"});
    this.chainService.certify_grapes(grape_asset_UUID,accreditation_ID,timestamp).then(result => {
      console.log(result);
      this.msgs.push({text:result,level:"alert-success"});
    }).catch(reason => {
      this.msgs.push({text:reason.toString(),level:"alert-danger"});
    });
  }
}
