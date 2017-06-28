"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_chain_route_1 = require("./base-chain-route");
var EnrollRoutes = (function (_super) {
    __extends(EnrollRoutes, _super);
    function EnrollRoutes() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnrollRoutes.prototype.create = function () {
        var _this = this;
        //log
        console.log("[EnrollRoutes.create] Creating enrollment routes.");
        //add enroll route
        this.router.post("/enroll", function (req, res) {
            _this.enroll(req, res);
        });
        // unenroll route
        this.router.post("/unenroll", function (req, res) {
            _this.unenroll(req, res);
        });
        // add route to check enrollment
        this.router.get("/enrollment", function (req, res) {
            _this.getEnrollment(req, res);
        });
    };
    EnrollRoutes.prototype.enroll = function (req, res) {
        var _this = this;
        if (typeof req.body.enrollId !== "undefined" && typeof req.body.enrollSecret !== "undefined") {
            this.chain.enroll(req.body.enrollId, req.body.enrollSecret, function (err, user) {
                if (err) {
                    console.log("ERROR: failed to enroll user: %s", err);
                    res.status(400).send("Failed to enroll user");
                }
                else {
                    console.log("Successfully enrolled user: %s", user.getName());
                    // Add username to session
                    req.session['enrolledID'] = user.getName();
                    // add certificate if not set
                    _this.store.getValue(user.getName() + '_certs', function (err, cert_str) {
                        if (err) {
                            res.status(400).send("Failed to access keyVal store");
                        }
                        else {
                            if (cert_str === null) {
                                // get new certificate
                                user.getUserCert(['role'], function (err, cert) {
                                    if (err) {
                                        console.log("ERROR: failed to get user certificate: %s", err);
                                        res.status(400).send("Failed to get user certificate");
                                    }
                                    else {
                                        console.log("Successfully received user certificate");
                                        var certs = [];
                                        certs.push(cert);
                                        _this.store.setValue(user.getName() + '_certs', JSON.stringify(certs), function (err) {
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
        }
        else {
            res.status(400).send("Please use correct parameters");
        }
    };
    EnrollRoutes.prototype.unenroll = function (req, res) {
        if (typeof req.session['enrolledID'] !== 'undefined') {
            req.session['enrolledID'] = null;
        }
        res.send(true);
    };
    EnrollRoutes.prototype.getEnrollment = function (req, res) {
        if (typeof req.session['enrolledID'] === 'undefined' || req.session['enrolledID'] === null) {
            console.log("Not enrolled");
            res.send(false);
        }
        else {
            console.log("Currently enrolled as %s", req.session['enrolledID']);
            res.send(req.session['enrolledID']);
        }
    };
    return EnrollRoutes;
}(base_chain_route_1.BaseChainRoute));
exports.EnrollRoutes = EnrollRoutes;
