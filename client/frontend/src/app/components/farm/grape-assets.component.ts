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
  private produced_grapeAssets:GrapeAsset[];
  private authorizations:Authorization[];
  private msg:Message;

  constructor(private sharedSrv:SharedService,private chainService:ChainService) {
    super(sharedSrv);
  };

  OnInitialized():void {
    // get created grapes
    this.chainService.get_created_grapes(this.enrolledId).then(result => {
      this.produced_grapeAssets = result as GrapeAsset[];

      if(!this.produced_grapeAssets || (this.produced_grapeAssets && this.produced_grapeAssets.length == 0)){
        this.msg = {text:"No grape assets found", level:"alert-info"}
      } else {
        let now = Date.now();
        this.produced_grapeAssets.forEach((asset,asset_idx) => {
          // verify signature
          // TODO: move to AppComponent
          if(asset.AccreditationSignatures && asset.AccreditationSignatures.length > 0){
            asset.AccreditationSignatures.forEach((sig,sig_idx) => {
              if(sig.Revoked){
                // set to false
                this.produced_grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = false;
                console.log("invalid signature");
              } else {
                // verify authorization
                this.chainService.get_granted_authorization(sig.AccreditationID,this.enrolledId).then(result => {
                  let authorization = result as Authorization;
                  if(authorization.Revoked || now > Date.parse(authorization.Expires)) {
                    this.produced_grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = false;
                    console.log("invalid authorization");
                  } else {
                    // verify accreditation
                    this.chainService.get_accreditation(authorization.AccreditationID).then(result => {
                      let accreditation = result as Accreditation;
                      if(accreditation.Revoked || now > Date.parse(accreditation.Expires)) {
                        this.produced_grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = false;
                        console.log("invalid accreditation");
                      } else {
                        this.produced_grapeAssets[asset_idx].AccreditationSignatures[sig_idx].Valid = true;
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

    // get granted authorizations
    this.chainService.get_granted_authorizations(this.enrolledId).then(result => {
      let auths:Authorization[] = result as Authorization[];

      if(auths && auths.length > 0){
        this.authorizations = auths.filter(
          auth => !auth.Revoked
        );
      }

      if(!this.authorizations || (this.authorizations && this.authorizations.length == 0)) {
        this.msg = {text:"No authorizations found", level:"alert-info"};
      }

    });
  }

  certify_asset(grape_asset_UUID:string,accreditation_ID:string):void {
    let now:Date = new Date();
    console.log("certify %s with %s at %s",grape_asset_UUID,accreditation_ID,now.toISOString());
    this.msg = {text:"Certify grape asset..",level:"alert-info"};
    this.chainService.certify_grapes(grape_asset_UUID,accreditation_ID,now.toISOString()).then(result => {
      this.msg = {text:result,level:"alert-success"};
      this.OnInitialized();
    }).catch(reason => {
      this.msg = {text:reason.toString(),level:"alert-danger"};
    });
  }

}
