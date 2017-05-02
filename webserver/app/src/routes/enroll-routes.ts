import { Request, Response } from "express";
import { BaseChainRoute } from './base-chain-route';
import {Certificate, Member} from "hfc/lib/hfc";

export class EnrollRoutes extends BaseChainRoute {

    public create():void {
        //log
        console.log("[EnrollRoutes.create] Creating enrollment routes.");

        //add enroll route
        this.router.post("/enroll", (req: Request, res: Response) => {
            this.enroll(req, res);
        });

        // logout route
        this.router.post("/logout", (req:Request, res:Response)=>{
            this.logout(req,res);
        });

        // add route to check enrollment
        this.router.get("/enrollment", (req: Request, res: Response) => {
            this.getEnrollment(req,res);
        });
    }

    private enroll(req: Request, res: Response):void {
        if(typeof req.body.enrollId !== "undefined" && typeof req.body.enrollSecret !== "undefined"){
            this.chain.enroll(req.body.enrollId,req.body.enrollSecret, (err:Error,user:Member) => {
                if(err) {
                    console.log("ERROR: failed to enroll user: %s", err);
                    res.status(400).send("Failed to enroll user");
                } else {
                    console.log("Successfully enrolled user: %s", user.getName());
                    // Add username to session
                    req.session['enrolledID'] = user.getName();

                    // add certificate if not set
                    this.store.getValue(user.getName()+'_certs', (err:Error, cert_str:string) => {
                        if(err){
                            res.status(400).send("Failed to access keyVal store");
                        } else {
                            if(cert_str === null){
                                // get new certificate
                                user.getUserCert(['role'], (err:Error, cert:Certificate) => {
                                    if(err){
                                        console.log("ERROR: failed to get user certificate: %s", err);
                                        res.status(400).send("Failed to get user certificate");
                                    } else {
                                        console.log("Successfully received user certificate");

                                        let certs: Certificate[] = [];
                                        certs.push(cert);

                                        this.store.setValue(user.getName()+'_certs',JSON.stringify(certs),(err:Error) => {
                                            if(err){
                                                res.status(400).send("Failed to save user certificate");
                                            } else {
                                                console.log("Successfully saved user cert");
                                                res.send(user.getName());
                                            }
                                        });
                                    }
                                });
                            } else {
                                // we have a certificate
                                console.log("No need for a new certificate");
                                res.send(user.getName());
                            }
                        }
                    });
                }
            });
        } else {
            res.status(400).send("Please use correct parameters");
        }
    }

    private logout(req:Request, res:Response):void {
        if(typeof req.session['enrolledID'] !== 'undefined'){
            req.session['enrolledID'] = null;
        }
        res.send(true);
    }

    private getEnrollment(req: Request, res: Response):void {
        if(typeof req.session['enrolledID'] === 'undefined' || req.session['enrolledID'] === null){
            console.log("Not enrolled");
            res.send(false);
        } else {
            console.log("Currently enrolled as %s",req.session['enrolledID']);
            res.send(req.session['enrolledID']);
        }
    }
}