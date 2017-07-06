"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_chain_route_1 = require("./base-chain-route");
class ChaincodeRoutes extends base_chain_route_1.BaseChainRoute {
    create() {
        //log
        console.log("[ChaincodeRoutes.create] Creating chaincode routes.");
        this.router.post('/deploy', (req, res) => {
            this.deploy(req, res);
        });
        this.router.get('/ccid', (req, res) => {
            this.getChaincodeID(req, res);
        });
        this.router.post('/ccid', (req, res) => {
            this.setChaincodeID(req, res);
        });
    }
    deploy(req, res) {
        this.verifyUser(req, (err, user, tcerts) => {
            if (err) {
                console.log("Error: %s", err.message);
                res.status(400).send(err.message);
            }
            else {
                this.store.getValue(user.getName() + "_certs", (err, certsStr) => {
                    if (err) {
                        res.status(400).send("Failed to access keyVal store");
                    }
                    else {
                        let certs = JSON.parse(certsStr);
                        let cert_encoded = new Buffer(certs[0]['cert']).toString('base64');
                        this.deployChaincode(process.env.CCPATH, [cert_encoded], user, tcerts[0], (err, ccID) => {
                            if (err) {
                                console.log("Error: %s", err.message);
                                res.status(400).send(err.message);
                            }
                            else {
                                req.session['chaincodeID'] = ccID;
                                res.send(ccID);
                            }
                        });
                    }
                });
            }
        });
    }
    getChaincodeID(req, res) {
        if (typeof req.session['chaincodeID'] === 'undefined') {
            console.log("No chaincodeID known");
            res.send(false);
        }
        else {
            console.log("Current known chaincodeID %s", req.session['chaincodeID']);
            res.send(req.session['chaincodeID']);
        }
    }
    setChaincodeID(req, res) {
        if (typeof req.body['chaincodeID'] === 'undefined') {
            console.log("Please supply correct parameters");
        }
        else {
            req.session['chaincodeID'] = req.body['chaincodeID'];
            console.log("chaincodeID set to %s", req.body['chaincodeID']);
            res.send("chaincodeID set");
        }
    }
}
exports.ChaincodeRoutes = ChaincodeRoutes;
