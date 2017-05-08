import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class AuditorRoutes extends BaseChainRoute {
    public create():void {
        //log
        console.log("[AuditorRoutes.create] Creating Auditor routes.");

        // revoke signing certificate
        this.router.post("/auditor/revoke_signing_certificate", (req:Request, res:Response) => {
            this.revoke_signing_certificate(req,res);
        });

        // revoke signing authority from party
        this.router.post("/auditor/revoke_signing_authority", (req:Request, res:Response) => {
            this.revoke_signing_authority(req,res);
        });

        // revoke signature on grapes
        this.router.post("/auditor/revoke_signature", (req:Request, res:Response) => {
            this.revoke_signature(req,res);
        });
    }

    private revoke_signing_certificate(req:Request, res:Response):void {
        this.verifyRequest(req,["cid","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['cid'],req.body['timestamp']];
                this.invokeChaincode(ccID,'revoke_signing_certificate',args,user,tcert,(err:Error, result:any)=>{
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
        this.verifyRequest(req,["cid","party","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['cid'],req.body['party'],req.body['timestamp']];
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

    private revoke_signature(req:Request, res:Response):void {
        this.verifyRequest(req,["uuid","cid","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['uuid'],req.body['cid'],req.body['timestamp']];
                this.invokeChaincode(ccID,'revoke_signature',args,user,tcert,(err:Error, result:any)=>{
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