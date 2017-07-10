"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_chain_route_1 = require("./base-chain-route");
const auth_routes_1 = require("./auth-routes");
class EnrollRoutes extends base_chain_route_1.BaseChainRoute {
    create() {
        //log
        console.log("[EnrollRoutes.create] Creating enrollment routes.");
        //add enroll route
        this.router.post("/enroll", (req, res) => {
            this.enroll(req, res);
        });
        // unenroll route
        this.router.post("/unenroll", (req, res) => {
            this.unenroll(req, res);
        });
        // add route to check enrollment
        this.router.get("/enrollment", (req, res) => {
            this.getEnrollment(req, res);
        });
    }
    enroll(req, res) {
        // verify if user is logged in
        let wallet_user = auth_routes_1.AuthRoutes.authStatus(req);
        if (!wallet_user) {
            res.status(400).send("Please login first");
            return;
        }
        // verify parameters
        if (typeof req.body.enrollId === "undefined" || typeof req.body.enrollSecret === "undefined") {
            res.status(400).send("Please use correct parameters");
            return;
        }
        // verify identity validity (either unused, or linked to this user)
        this.wallet.getRegisteredIdentities()
            .then(result => {
            let existing = false;
            // verify if identity isn't already registered
            for (let i = 0; i < result.length; i++) {
                if (result[i].identity == req.body.enrollId && result[i].username != wallet_user) {
                    console.log("Identity %s already registered to other user", req.body.enrollId);
                    res.status(400).send("Incorrect identity");
                    return;
                }
                else if (result[i].identity == req.body.enrollId && result[i].username == wallet_user) {
                    // using existing identity
                    console.log("existing identity");
                    existing = true;
                }
            }
            // enroll user
            this.chain.enroll(req.body.enrollId, req.body.enrollSecret, (err, user) => {
                if (err) {
                    console.log("ERROR: failed to enroll user: %s", err);
                    res.status(400).send("Failed to enroll user");
                }
                else {
                    console.log("Successfully enrolled user: %s", user.getName());
                    // add identity to user if necessary
                    if (!existing) {
                        this.wallet.addIdentity(wallet_user, user.getName())
                            .then(() => {
                            console.log("Successfully added identity to %s", wallet_user);
                        })
                            .catch(err => {
                            console.log("Failded to save identity: %s", err.text());
                        });
                    }
                    // Add username to session
                    req.session['enrolledID'] = user.getName();
                    // add certificate if not set
                    this.store.getValue(user.getName() + '_certs', (err, cert_str) => {
                        if (err) {
                            res.status(400).send("Failed to access keyVal store");
                        }
                        else {
                            if (cert_str === null) {
                                // get new certificate
                                user.getUserCert(['role'], (err, cert) => {
                                    if (err) {
                                        console.log("ERROR: failed to get user certificate: %s", err);
                                        res.status(400).send("Failed to get user certificate");
                                    }
                                    else {
                                        console.log("Successfully received user certificate");
                                        let certs = [];
                                        certs.push(cert);
                                        this.store.setValue(user.getName() + '_certs', JSON.stringify(certs), (err) => {
                                            if (err) {
                                                res.status(400).send("Failed to save user certificate");
                                            }
                                            else {
                                                console.log("Successfully saved user cert");
                                                res.send(user.getName());
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                // we have a certificate
                                console.log("No need for a new certificate");
                                res.send(user.getName());
                            }
                        }
                    });
                }
            });
        })
            .catch(err => {
            console.log("Error: ", err.text());
        });
    }
    unenroll(req, res) {
        if (typeof req.session['enrolledID'] !== 'undefined') {
            req.session['enrolledID'] = null;
        }
        res.send(true);
    }
    getEnrollment(req, res) {
        if (typeof req.session['enrolledID'] === 'undefined' || req.session['enrolledID'] === null) {
            console.log("Not enrolled");
            res.send(false);
        }
        else {
            console.log("Currently enrolled as %s", req.session['enrolledID']);
            res.send(req.session['enrolledID']);
        }
    }
}
exports.EnrollRoutes = EnrollRoutes;
