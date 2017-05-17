import * as hfc from 'hfc';
import { Router, Request } from "express";
import {Chain, KeyValStore, Member, TCert, TransactionContext} from "hfc/lib/hfc";

export abstract class BaseChainRoute {
    protected router:Router;
    protected chain:Chain;
    protected store:KeyValStore;

    constructor(router:Router, chain:Chain){
        this.router = router;
        this.chain = chain;

        this.store = this.chain.getKeyValStore();
    }

    protected abstract create():void

    protected verifyUser(req:Request,cb:Function):void {
        // check if user is logged in
        if(typeof req.session['enrolledID'] !== 'undefined' && req.session['enrolledID'] !== null){
            // get user object from chain
            this.chain.getMember(req.session['enrolledID'],(err:Error, user:Member)=>{
                if(err) {
                    cb(new Error("Failed to retrieve user"));
                } else {
                    // get user tcerts from chain storage
                    this.store.getValue(req.session['enrolledID']+"_certs", (err:Error, certsStr:string) => {
                        if(err){
                            cb(new Error("Failed to access keyVal store"));
                        } else {
                            let certs:any[] = JSON.parse(certsStr);
                            let tcerts:TCert[] = [];

                            for(let i:number = 0;i<certs.length;i++){
                                tcerts.push(this.getTCert(certs[i]));
                            }

                            cb(null,user,tcerts);
                        }
                    });
                }
            });
        } else {
            cb(new Error("Please login first"))
        }
    }

    protected verifyRequest(req:Request,requiredParams:string[],cb:Function):void {
        this.verifyUser(req,(err:Error,user:Member,tcerts:TCert[])=>{
            if(err){
                cb(new Error(err.message));
            } else {
                // validate input parameters
                let validRequest:boolean = true;
                for(let param of requiredParams){
                    if (typeof req.body[param] === 'undefined') {
                        validRequest = false;
                        console.log(param,"not found")
                    }
                }

                if(!validRequest) {
                    cb(new Error("Please supply correct parameters"))
                } else {
                    // check if a chaincodeID is known
                    if(typeof req.session['chaincodeID'] === 'undefined'){
                        cb(new Error("No known chaincodeID"));
                    } else {
                        cb(null,user,tcerts[0],req.session['chaincodeID']);
                    }
                }
            }
        });
    }

    protected verifyQueryRequest(req:Request,requiredParams:string[],cb:Function):void {
        this.verifyUser(req,(err:Error,user:Member,tcerts:TCert[])=> {
            if (err) {
                cb(new Error(err.message));
            } else {
                // validate input parameters
                let validRequest:boolean = true;
                for(let param of requiredParams){
                    if (typeof req.params[param] === 'undefined') {
                        console.log("param %s not found",param);
                        validRequest = false
                    }
                }

                if(!validRequest) {
                    cb(new Error("Please supply correct parameters!"))
                } else {
                    // check if a chaincodeID is known
                    if(typeof req.session['chaincodeID'] === 'undefined'){
                        cb(new Error("No known chaincodeID"));
                    } else {
                        cb(null,user,tcerts[0],req.session['chaincodeID']);
                    }
                }
            }
        });
    }

    protected getTCert(tcert_object:any):TCert {
        let privateKey = this.chain.cryptoPrimitives.ecdsaKeyFromPrivate(tcert_object['privateKey']['priv'],'hex');
        return new hfc.TCert(tcert_object['publicKey'],privateKey);
    }

    protected deployChaincode(ccPath:string,args:string[],user:Member,tcert:TCert,cb:Function):void {
        // construct deploy request
        let deployRequest:any = {
            fcn: "init",
            args: args,
            userCert: tcert,
            chaincodePath: ccPath,
        };

        console.log("Deploying chaincode..");

        let tx:TransactionContext = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.deploy(deployRequest);

        tx.on("complete", (results:any) => {
            // deploy request completed successfully
            console.log("Deploy completed, chaincodeID: %s",results['chaincodeID']);
            cb(null,results['chaincodeID'])
        });

        tx.on("error", (error:Error) => {
            console.log("Failed to deploy chaincode: request=%j, error=%k", deployRequest, error);
            cb(new Error("Failed to deploy chaincode.."), null)
        });
    }

    protected invokeChaincode(chaincodeID:string,fcn:string,args:string[],user:Member,tcert:TCert,cb:Function):void {
        let invokeRequest:any = {
            chaincodeID: chaincodeID,
            fcn: fcn,
            args: args,
            userCert: tcert
        };

        console.log("Invoking function %s on %s",fcn,chaincodeID);

        let tx:TransactionContext = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.invoke(invokeRequest);

        tx.on('submitted',(results:any)=>{
            console.log("Invoke submitted successfully; results=%j",results);
        });

        tx.on('complete', (results:any) => {
            console.log("Invoke completed successfully; results=%j",results);
            cb(null,results);
        });

        tx.on('error', (error:Error) => {
            console.log("Failed to invoke chaincode: request=%j, error=%k", invokeRequest, error);
            cb(new Error("Failed to invoke chaincode"), null)
        });
    }

    protected queryChaincode(chaincodeID:string,fcn:string,args:string[],user:Member,tcert:TCert,cb:Function):void {
        let queryRequest:any = {
            chaincodeID: chaincodeID,
            fcn: fcn,
            args: args,
            userCert: tcert
        };

        //console.log("Querying function %s on %s",fcn,chaincodeID);

        let tx:TransactionContext = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.query(queryRequest);

        // listen for events
        tx.on('complete', function(data){
            let result = data.result.toString();
            //console.log("Query completed successfully; results=%s", result);
            cb(null,result);
        });

        tx.on('error', function(error){
            console.log("Failed to query chaincode: request=%j, error=%k", queryRequest, error);
            cb(error,null);
        });
    }
}