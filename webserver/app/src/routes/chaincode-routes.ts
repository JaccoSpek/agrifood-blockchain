import { Request, Response } from "express";
import { BaseChainRoute } from './base-chain-route';
import { Member, TCert } from "hfc/lib/hfc";
import {AuthRoutes} from "./auth-routes";

export class ChaincodeRoutes extends BaseChainRoute {
    public create():void {
        //log
        console.log("[ChaincodeRoutes.create] Creating chaincode routes.");

        this.router.post('/deploy', (req: Request, res: Response) => {
            this.deploy(req,res);
        });

        this.router.get('/ccid', (req: Request, res: Response) => {
            this.getChaincodeID(req,res);
        });

        this.router.post('/ccid', (req:Request, res: Response) => {
            this.setChaincodeID(req,res);
        });

        this.router.get('/wallet/addresses', (req:Request, res:Response) => {
           this.getAddresses(req,res);
        });
    }

    private deploy(req:Request, res:Response):void {
        this.verifyUser(req,(err:Error,user:Member,tcerts:TCert[]) =>{
            if(err){
                console.log("Error: %s",err.message);
                res.status(400).send(err.message)
            } else {
                this.store.getValue(user.getName()+"_certs",(err:Error, certsStr:string) => {
                    if(err){
                        res.status(400).send("Failed to access keyVal store");
                    } else {
                        let certs:Object[] = JSON.parse(certsStr);
                        let cert_encoded = new Buffer(certs[0]['cert']).toString('base64');

                        this.deployChaincode(process.env.CCPATH,[cert_encoded],user,tcerts[0],(err,ccID)=>{
                            if(err){
                                console.log("Error: %s",err.message);
                                res.status(400).send(err.message)
                            } else {
                                req.session['chaincodeID'] = ccID;

                                let wallet_user:string = AuthRoutes.authStatus(req);
                                if(wallet_user){
                                    this.wallet.addAddress(wallet_user,ccID);
                                }

                                res.send(ccID);
                            }

                        });
                    }
                });
            }
        });
    }

    private getChaincodeID(req: Request, res: Response):void {
        if(typeof req.session['chaincodeID'] === 'undefined'){
            console.log("No chaincodeID known");
            res.send(false);
        } else {
            console.log("Current known chaincodeID %s",req.session['chaincodeID']);
            res.send(req.session['chaincodeID']);
        }
    }

    private setChaincodeID(req:Request, res: Response):void {
        if(typeof req.body['chaincodeID'] === 'undefined'){
            console.log("Please supply correct parameters")
        } else {
            req.session['chaincodeID'] = req.body['chaincodeID'];
            console.log("chaincodeID set to %s",req.body['chaincodeID']);

            let wallet_user:string = AuthRoutes.authStatus(req);
            if(wallet_user){
                this.wallet.addAddress(wallet_user,req.body['chaincodeID']);
            }

            res.send("chaincodeID set");
        }
    }

    // resturn my registerred addresses
    private getAddresses(req:Request, res:Response):void {
        let wallet_user:string = AuthRoutes.authStatus(req);
        if(wallet_user){
            this.wallet.getUserAddresses(wallet_user)
                .then(result => {
                    let addresses:string[] = [];

                    for(let i:number = 0; i < result.length; i++){
                        addresses.push( result[i].address );
                    }

                    res.send(addresses);
                })
                .catch(err => {
                    res.status(400).send(err.text());
                });
        } else {
            res.status(400).send("Please login first");
        }
    }
}