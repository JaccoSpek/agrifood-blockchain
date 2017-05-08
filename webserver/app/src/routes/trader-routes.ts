import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class TraderRoutes extends BaseChainRoute {
    public create():void {
        //log
        console.log("[TraderRoutes.create] Creating Trader routes.");

        // transfer grapes
        this.router.post("/trader/transfer_grapes", (req:Request, res:Response) => {
            this.transfer_grapes(req,res);
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