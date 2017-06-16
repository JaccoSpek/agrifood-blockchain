import {Component}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {Accreditation, Authorization, GrapeAsset, Message} from "../../types";
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

      if(!this.grapeAssets || (this.grapeAssets && this.grapeAssets.length == 0)){
        this.msg = {text:"No grape assets found", level:"alert-info"}
      } else {
        let now = Date.now();
        this.grapeAssets.forEach((asset,asset_idx) => {
          // verify signature
          if(asset.AccreditationSignatures && asset.AccreditationSignatures.length > 0){
            asset.AccreditationSignatures.forEach((sig,sig_idx) => {
              if(sig.Revoked){
                // set to false
                this.grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = false;
                console.log("invalid signature");
              } else {
                // verify authorization
                this.chainService.get_granted_authorization(sig.AccreditationID,this.enrolledId).then(result => {
                  let authorization = result as Authorization;
                  if(authorization.Revoked || now > Date.parse(authorization.Expires)) {
                    this.grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = false;
                    console.log("invalid authorization");
                  } else {
                    // verify accreditation
                    this.chainService.get_accreditation(authorization.AccreditationID).then(result => {
                      let accreditation = result as Accreditation;
                      if(accreditation.Revoked || now > Date.parse(accreditation.Expires)) {
                        this.grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = false;
                        console.log("invalid accreditation");
                      } else {
                        this.grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = true;
                        console.log("valid");
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

    });
  }

}
