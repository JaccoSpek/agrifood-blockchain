import { Request, Response } from "express";
import { BaseChainRoute } from "./base-chain-route";
import {Member, TCert} from "hfc/lib/hfc";

export class PublicRoutes extends BaseChainRoute {
    public create():void {
        //log
        console.log("[PublicRoutes.create] Creating public routes.");

        // get grape provenance
        this.router.get("/grape_ownership_trail/:uuid", (req:Request, res:Response) => {
            this.grape_ownership_trail(req,res);
        });

        // get grape signatures
        this.router.get("/grape_signatures/:uuid", (req:Request, res:Response) => {
            this.grape_signatures(req,res);
        });

        // get signer authorizations
        this.router.get("/signer_certs/:farmid", (req:Request, res:Response) => {
            this.signer_certs(req,res);
        });

        // get caller role
        this.router.get("/role", (req:Request, res:Response) => {
            this.get_caller_role(req,res);
        });

        // get caller role
        this.router.get("/role_parties/:role", (req:Request, res:Response) => {
            this.get_role_parties(req,res);
        });

        // get party accreditations
        this.router.get("/get_party_accreditations/:party", (req:Request, res:Response) => {
            this.get_party_accreditations(req,res);
        });

        // get issued accreditations
        this.router.get("/get_issued_accreditations/:party", (req:Request, res:Response) => {
            this.get_issued_accreditations(req,res);
        });

        // get accreditation by id
        this.router.get("/get_accreditation/:accr_id", (req:Request, res:Response) => {
            this.get_accreditation(req,res);
        });

        // get issued authorizations
        this.router.get("/get_issued_authorizations/:party", (req:Request, res:Response) => {
            this.get_issued_authorizations(req,res);
        });

        // get issued authorizations
        this.router.get("/get_granted_authorizations/:party", (req:Request, res:Response) => {
            this.get_granted_authorizations(req,res);
        });

        // get specific authorization
        this.router.get("/get_granted_authorization/:accr_id/:authorized_party", (req:Request, res:Response) => {
            this.get_granted_authorization(req,res);
        });

        // get all authorizations
        this.router.get("/get_authorizations", (req:Request, res:Response) => {
            this.get_authorizations(req,res);
        });

        // get created grapes
        this.router.get("/get_created_grapes/:party", (req:Request, res:Response) => {
            this.get_created_grapes(req,res);
        });

        // get own grapes
        this.router.get("/get_own_grapes", (req:Request, res:Response) => {
            this.get_own_grapes(req,res);
        });

        // get all grapes
        this.router.get("/get_all_grapes", (req:Request, res:Response) => {
            this.get_all_grapes(req,res);
        });

        // get accreditations
        this.router.get("/get_accreditations", (req:Request, res:Response) => {
            this.get_accreditations(req,res);
        });

    }

    private grape_ownership_trail(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['uuid'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['uuid']];
                this.queryChaincode(ccID,"grape_ownership_trail",args,user,tcert,(err:Error, result:any)=>{
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

    private grape_signatures(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['uuid'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['uuid']];
                this.queryChaincode(ccID,"grape_signatures",args,user,tcert,(err:Error, result:any)=>{
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

    private get_caller_role(req:Request, res:Response):void {
        this.verifyQueryRequest(req,[],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [];
                this.queryChaincode(ccID,"get_caller_role",args,user,tcert,(err:Error, result:any)=>{
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

    private get_role_parties(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['role'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['role']];
                this.queryChaincode(ccID,"get_role_parties",args,user,tcert,(err:Error, result:any)=>{
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

    private get_party_accreditations(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['party'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['party']];
                this.queryChaincode(ccID,"get_party_accreditations",args,user,tcert,(err:Error, result:any)=>{
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

    private get_issued_accreditations(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['party'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['party']];
                this.queryChaincode(ccID,"get_issued_accreditations",args,user,tcert,(err:Error, result:any)=>{
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

    private get_accreditation(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['accr_id'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['accr_id']];
                this.queryChaincode(ccID,"get_accreditation",args,user,tcert,(err:Error, result:any)=>{
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

    private get_accreditations(req:Request, res:Response):void {
        this.verifyQueryRequest(req,[],(err:Error,user:Member,tcert:TCert,ccID:string) => {
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [];
                this.queryChaincode(ccID,"get_accreditations",args,user,tcert,(err:Error, result:any)=>{
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

    private get_issued_authorizations(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['party'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['party']];
                this.queryChaincode(ccID,"get_issued_authorizations",args,user,tcert,(err:Error, result:any)=>{
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

    private get_granted_authorizations(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['party'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['party']];
                this.queryChaincode(ccID,"get_granted_authorizations",args,user,tcert,(err:Error, result:any)=>{
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

    private get_granted_authorization(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['accr_id','authorized_party'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['accr_id'],req.params['authorized_party']];
                this.queryChaincode(ccID,"get_granted_authorization",args,user,tcert,(err:Error, result:any)=>{
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

    private get_authorizations(req:Request, res:Response):void {
        this.verifyQueryRequest(req,[],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [];
                this.queryChaincode(ccID,"get_authorizations",args,user,tcert,(err:Error, result:any)=>{
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

    private get_created_grapes(req:Request, res:Response):void {
        this.verifyQueryRequest(req,['party'],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [req.params['party']];
                this.queryChaincode(ccID,"get_created_grapes",args,user,tcert,(err:Error, result:any)=>{
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

    private get_own_grapes(req:Request, res:Response):void {
        this.verifyQueryRequest(req,[],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [];
                this.queryChaincode(ccID,"get_own_grapes",args,user,tcert,(err:Error, result:any)=>{
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

    private get_all_grapes(req:Request, res:Response):void {
        this.verifyQueryRequest(req,[],(err:Error,user:Member,tcert:TCert,ccID:string)=>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message);
            } else {
                let args = [];
                this.queryChaincode(ccID,"get_all_grapes",args,user,tcert,(err:Error, result:any)=>{
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