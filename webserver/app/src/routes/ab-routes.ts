import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class ABRoutes extends BaseChainRoute {
    public create():void {
        //logs
        console.log("[ABRoutes.create] Creating AccreditationBody routes.");

        // add signing accreditation to world-state
        this.router.post("/ab/add_signing_accreditation", (req:Request, res:Response) => {
            this.add_signing_accreditation(req,res);
        });

        // issue signing accreditation to certificate body
        this.router.post("/ab/issue_signing_accreditation", (req:Request, res:Response) => {
            this.issue_signing_accreditation(req,res);
        });

        // revoke signing accreditation
        this.router.post("/ab/revoke_signing_accreditation", (req:Request, res:Response) => {
            this.revoke_signing_accreditation(req,res);
        });


    }

    private add_signing_accreditation(req:Request, res:Response):void {
        this.verifyRequest(req,["id","description","created_date","expiration_date"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['id'],req.body['description'],req.body['created_date'],req.body['expiration_date']];
                this.invokeChaincode(ccID,'add_signing_accreditation',args,user,tcert,(err:Error, result:any)=>{
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

    private issue_signing_accreditation(req:Request, res:Response):void {
        this.verifyRequest(req,["accr_id","cb"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['accr_id'],req.body['cb']];
                this.invokeChaincode(ccID,'issue_signing_accreditation',args,user,tcert,(err:Error, result:any)=>{
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

    private revoke_signing_accreditation(req:Request, res:Response):void {
        this.verifyRequest(req,["cid","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['cid'],req.body['timestamp']];
                this.invokeChaincode(ccID,'revoke_signing_accreditation',args,user,tcert,(err:Error, result:any)=>{
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