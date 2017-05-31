import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class CBRoutes extends BaseChainRoute {
    public create():void {
        //log
        console.log("[CBRoutes.create] Creating CertificationBody routes.");

        // grant signing authority to party
        this.router.post("/cb/grant_signing_authority", (req:Request, res:Response) => {
            this.grant_signing_authority(req,res);
        });

        // revoke signing authority from party
        this.router.post("/cb/revoke_signing_authority", (req:Request, res:Response) => {
            this.revoke_signing_authority(req,res);
        });

    }

    private grant_signing_authority(req:Request, res:Response):void {
        this.verifyRequest(req,["accr_id","farm","expiration_date"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['accr_id'],req.body['farm'],req.body['expiration_date']];
                this.invokeChaincode(ccID,'grant_signing_authority',args,user,tcert,(err:Error, result:any)=>{
                    if(err) {
                        console.log("Error: %s",err.message);
                        res.status(400).send(err.message)
                    } else {
                        console.log("successfully invoked transaction: %s", result);
                        res.send("successfully invoked transaction");
                    }
                });
            }
        });
    }

    private revoke_signing_authority(req:Request, res:Response):void {
        this.verifyRequest(req,["accr_id","party","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['accr_id'],req.body['party'],req.body['timestamp']];
                this.invokeChaincode(ccID,'revoke_signing_authority',args,user,tcert,(err:Error, result:any)=>{
                    if(err) {
                        console.log("Error: %s",err.message);
                        res.status(400).send(err.message)
                    } else {
                        console.log("successfully invoked transaction: %s", result);
                        res.send("successfully invoked transaction");
                    }
                });
            }
        });
    }


}