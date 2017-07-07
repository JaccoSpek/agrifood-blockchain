"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hfc = require("hfc");
class BaseChainRoute {
    constructor(router, chain) {
        this.router = router;
        this.chain = chain;
        this.store = this.chain.getKeyValStore();
    }
    verifyUser(req, cb) {
        // check if user is enrolled in
        if (typeof req.session['enrolledID'] !== 'undefined' && req.session['enrolledID'] !== null) {
            // get user object from chain
            this.chain.getMember(req.session['enrolledID'], (err, user) => {
                if (err) {
                    cb(new Error("Failed to retrieve user"));
                }
                else {
                    // get user tcerts from chain storage
                    this.store.getValue(req.session['enrolledID'] + "_certs", (err, certsStr) => {
                        if (err) {
                            cb(new Error("Failed to access keyVal store"));
                        }
                        else {
                            let certs = JSON.parse(certsStr);
                            let tcerts = [];
                            for (let i = 0; i < certs.length; i++) {
                                tcerts.push(this.getTCert(certs[i]));
                            }
                            cb(null, user, tcerts);
                        }
                    });
                }
            });
        }
        else {
            cb(new Error("Please enroll first!"));
        }
    }
    verifyRequest(req, requiredParams, cb) {
        this.verifyUser(req, (err, user, tcerts) => {
            if (err) {
                cb(new Error(err.message));
            }
            else {
                // validate input parameters
                let validRequest = true;
                for (let param of requiredParams) {
                    if (typeof req.body[param] === 'undefined') {
                        validRequest = false;
                        console.log(param, "not found");
                    }
                }
                if (!validRequest) {
                    cb(new Error("Please supply correct parameters"));
                }
                else {
                    // check if a chaincodeID is known
                    if (typeof req.session['chaincodeID'] === 'undefined') {
                        cb(new Error("No known chaincodeID"));
                    }
                    else {
                        cb(null, user, tcerts[0], req.session['chaincodeID']);
                    }
                }
            }
        });
    }
    verifyQueryRequest(req, requiredParams, cb) {
        this.verifyUser(req, (err, user, tcerts) => {
            if (err) {
                cb(new Error(err.message));
            }
            else {
                // validate input parameters
                let validRequest = true;
                for (let param of requiredParams) {
                    if (typeof req.params[param] === 'undefined') {
                        console.log("param %s not found", param);
                        validRequest = false;
                    }
                }
                if (!validRequest) {
                    cb(new Error("Please supply correct parameters!"));
                }
                else {
                    // check if a chaincodeID is known
                    if (typeof req.session['chaincodeID'] === 'undefined') {
                        cb(new Error("No known chaincodeID"));
                    }
                    else {
                        cb(null, user, tcerts[0], req.session['chaincodeID']);
                    }
                }
            }
        });
    }
    getTCert(tcert_object) {
        let privateKey = this.chain.cryptoPrimitives.ecdsaKeyFromPrivate(tcert_object['privateKey']['priv'], 'hex');
        return new hfc.TCert(tcert_object['publicKey'], privateKey);
    }
    deployChaincode(ccPath, args, user, tcert, cb) {
        // construct deploy request
        let deployRequest = {
            fcn: "init",
            args: args,
            userCert: tcert,
            chaincodePath: ccPath,
        };
        console.log("Deploying chaincode..");
        let tx = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.deploy(deployRequest);
        tx.on("complete", (results) => {
            // deploy request completed successfully
            console.log("Deploy completed, chaincodeID: %s", results['chaincodeID']);
            cb(null, results['chaincodeID']);
        });
        tx.on("error", (error) => {
            console.log("Failed to deploy chaincode: request=%j, error=%k", deployRequest, error);
            cb(new Error("Failed to deploy chaincode.."), null);
        });
    }
    invokeChaincode(chaincodeID, fcn, args, user, tcert, cb) {
        let invokeRequest = {
            chaincodeID: chaincodeID,
            fcn: fcn,
            args: args,
            userCert: tcert
        };
        console.log("Invoking function %s on %s", fcn, chaincodeID);
        let tx = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.invoke(invokeRequest);
        tx.on('submitted', (results) => {
            console.log("Invoke submitted successfully; results=%j", results);
        });
        tx.on('complete', (results) => {
            console.log("Invoke completed successfully; results=%j", results);
            cb(null, results);
        });
        tx.on('error', (error) => {
            console.log("Failed to invoke chaincode: request=%j, error=%k", invokeRequest, error);
            cb(new Error("Failed to invoke chaincode"), null);
        });
    }
    queryChaincode(chaincodeID, fcn, args, user, tcert, cb) {
        let queryRequest = {
            chaincodeID: chaincodeID,
            fcn: fcn,
            args: args,
            userCert: tcert
        };
        //console.log("Querying function %s on %s",fcn,chaincodeID);
        let tx = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.query(queryRequest);
        // listen for events
        tx.on('complete', function (data) {
            let result = data.result.toString();
            //console.log("Query completed successfully; results=%s", result);
            cb(null, result);
        });
        tx.on('error', function (error) {
            console.log("Failed to query chaincode: request=%j, error=%k", queryRequest, error);
            cb(error, null);
        });
    }
}
exports.BaseChainRoute = BaseChainRoute;
