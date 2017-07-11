import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class FarmRoutes extends BaseChainRoute {
    public create():void {
        //log
        console.log("[FarmRoutes.create] Creating Farm routes.");

        // create grape assets
        this.router.post("/farm/create_grapes", (req:Request, res:Response) => {
            this.create_grapes(req,res);
        });

        // certify grape assets
        this.router.post("/farm/certify_grapes", (req:Request, res:Response) => {
            this.certify_grapes(req,res);
        });

        // revoke asset signature
        this.router.post("/farm/revoke_signature", (req:Request, res:Response) => {
            this.revoke_signature(req,res);
        });

        // transfer grape assets
        this.router.post("/farm/transfer_grapes", (req:Request, res:Response) => {
            this.transfer_grapes(req,res);
        });

    }

    private create_grapes(req:Request, res:Response):void {
        this.verifyRequest(req,["uuid","timestamp","amount"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['uuid'],req.body['timestamp'],req.body['amount']];
                this.invokeChaincode(ccID,'create_grapes',args,user,tcert,(err:Error, result:any)=>{
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

    private certify_grapes(req:Request, res:Response):void {
        this.verifyRequest(req,["uuid","accr_id","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['uuid'],req.body['accr_id'],req.body['timestamp']];
                this.invokeChaincode(ccID,'certify_grapes',args,user,tcert,(err:Error, result:any)=>{
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
        this.verifyRequest(req,["uuid","accr_id","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['uuid'],req.body['accr_id'],req.body['timestamp']];
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

    private transfer_grapes(req:Request, res:Response):void {
        this.verifyRequest(req,["uuid","party","timestamp"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['uuid'],req.body['party'],req.body['timestamp']];
                this.invokeChaincode(ccID,'transfer_grapes',args,user,tcert,(err:Error, result:any)=>{
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