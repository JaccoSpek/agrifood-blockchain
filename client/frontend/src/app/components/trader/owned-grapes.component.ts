import {Component}    from '@angular/core';
import { AppComponent } from "../../app.component";
import {Accreditation, Authorization, GrapeAsset, Message} from "../../types";
import {SharedService} from "../../services/shared.service";
import {ChainService} from "../../services/chain.service";

@Component({
  moduleId: module.id,
  selector: 'owned-grapes',
  templateUrl: 'owned-grapes.component.html'
})
export class OwnedGrapesComponent extends AppComponent{
  private grapeAssets:GrapeAsset[];
  private traders:string[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    this.chainService.get_own_grapes().then(result => {
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

    // get traders
    this.chainService.get_role_parties("Trader").then(result => {
      let list = result as string[];
      this.traders = list.filter(
        trader => trader!=this.enrolledId
      );
    });
  }

  transfer_asset(grape_asset_UUID:string,trader_ID:string):void {
    let now:Date = new Date();
    console.log("Transfer grapes %s to %s at %s",grape_asset_UUID,trader_ID,now.toISOString());
    this.msg = {text:"Transfer grape asset..",level:"alert-info"};
    this.chainService.transfer_grapes(grape_asset_UUID,trader_ID,now.toISOString()).then(result => {
      this.msg = {text:result,level:"alert-success"};
      this.OnInitialized();
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }

}
