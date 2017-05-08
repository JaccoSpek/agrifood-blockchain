import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class AdminRoutes extends BaseChainRoute {
    public create(): void {
        //log
        console.log("[AdminRoutes.create] Creating admin routes.");

        // add admin certificate
        this.router.post("/add_admin", (req:Request, res:Response) => {
            this.addAdmin(req, res);
        });

        // add new party
        this.router.post("/add_party", (req:Request, res:Response) => {
            this.addParty(req, res);
        });
    }

    private addAdmin(req:Request, res:Response):void {
        this.verifyRequest(req,["certificate"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                let args = [req.body['certificate']];
                this.invokeChaincode(ccID,'add_admin',args,user,tcert,(err:Error, result:any)=>{
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

    // Add a party to the smart contract
    private addParty(req:Request, res:Response):void {
        this.verifyRequest(req,["id","role"],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err) {
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                // get certificates of user
                this.store.getValue(req.body['id']+"_certs", (err:Error, certsStr:string) => {
                    if(err) {
                        console.log("Error: %s",err.message);
                        res.status(400).send(err.message)
                    } else {
                        let certs:any[] = JSON.parse(certsStr);
                        let party_tcert:TCert = this.getTCert(certs[0]);
                        let pubkey_enc = new Buffer(party_tcert.cert).toString('base64');

                        let args:any[] = [req.body['id'],req.body['role'],pubkey_enc];
                        this.invokeChaincode(ccID,'add_party',args,user,tcert,(err:Error, result:any)=>{
                            if(err) {
                                console.log("Error: %s",err.message);
                                res.status(400).send(err.message)
                            } else {
                                console.log("successfully executed transaction: %s", result);
                                res.send("successfully executed transaction");
                            }
                        });
                    }
                });
            }
        });
    }
}