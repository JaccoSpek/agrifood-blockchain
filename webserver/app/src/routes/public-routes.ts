import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class PublicRoutes extends BaseChainRoute {
    public create():void {
        //log
        console.log("[PublicRoutes.create] Creating public routes.");

        // get grape provenance
        this.router.get("/grape_provenance/:uuid", (req:Request, res:Response) => {
            this.grape_provenance(req,res);
        });

        // get grape certification
        this.router.get("/grape_certification/:uuid", (req:Request, res:Response) => {
            this.grape_certification(req,res);
        });

        // get signer authorizations
        this.router.get("/signer_certs/:farmid", (req:Request, res:Response) => {
            this.signer_certs(req,res);
        });


    }

    private grape_provenance(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['uuid'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['uuid']];
                this.queryChaincode(ccID,"grape_provenance",args,user,tcert,(err:Error, result:any)=>{
                    if(err) {
                        console.log("Error: %s",err.message);
                        res.status(400).send(err.message);
                    } else {
                        console.log("Queried results: %s", result);
                        res.type('json').send(result);
                    }
                });
            }
        });
    }

    private grape_certification(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['uuid'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['uuid']];
                this.queryChaincode(ccID,"grape_certification",args,user,tcert,(err:Error, result:any)=>{
                    if(err) {
                        console.log("Error: %s",err.message);
                        res.status(400).send(err.message);
                    } else {
                        console.log("Queried results: %s", result);
                        res.type('json').send(result);
                    }
                });
            }
        });
    }

    private signer_certs(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['party'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['party']];
                this.queryChaincode(ccID,"signer_certs",args,user,tcert,(err:Error, result:any)=>{
                    if(err) {
                        console.log("Error: %s",err.message);
                        res.status(400).send(err.message);
                    } else {
                        console.log("Queried results: %s", result);
                        res.type('json').send(result);
                    }
                });
            }
        });
    }

}