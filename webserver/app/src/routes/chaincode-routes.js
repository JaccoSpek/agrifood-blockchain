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
var ChaincodeRoutes = (function (_super) {
    __extends(ChaincodeRoutes, _super);
    function ChaincodeRoutes() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChaincodeRoutes.prototype.create = function () {
        var _this = this;
        //log
        console.log("[ChaincodeRoutes.create] Creating chaincode routes.");
        this.router.post('/deploy', function (req, res) {
            _this.deploy(req, res);
        });
        this.router.get('/ccid', function (req, res) {
            _this.getChaincodeID(req, res);
        });
        this.router.post('/ccid', function (req, res) {
            _this.setChaincodeID(req, res);
        });
    };
    ChaincodeRoutes.prototype.deploy = function (req, res) {
        var _this = this;
        this.verifyUser(req, function (err, user, tcerts) {
            if (err) {
                console.log("Error: %s", err.message);
                res.status(400).send(err.message);
            }
            else {
                _this.store.getValue(user.getName() + "_certs", function (err, certsStr) {
                    if (err) {
                        res.status(400).send("Failed to access keyVal store");
                    }
                    else {
                        var certs = JSON.parse(certsStr);
                        var cert_encoded = new Buffer(certs[0]['cert']).toString('base64');
                        _this.deployChaincode(process.env.CCPATH, [cert_encoded], user, tcerts[0], function (err, ccID) {
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
    };
    ChaincodeRoutes.prototype.getChaincodeID = function (req, res) {
        if (typeof req.session['chaincodeID'] === 'undefined') {
            console.log("No chaincodeID known");
            res.send(false);
        }
        else {
            console.log("Current known chaincodeID %s", req.session['chaincodeID']);
            res.send(req.session['chaincodeID']);
        }
    };
    ChaincodeRoutes.prototype.setChaincodeID = function (req, res) {
        if (typeof req.body['chaincodeID'] === 'undefined') {
            console.log("Please supply correct parameters");
        }
        else {
            req.session['chaincodeID'] = req.body['chaincodeID'];
            console.log("chaincodeID set to %s", req.body['chaincodeID']);
            res.send("chaincodeID set");
        }
    };
    return ChaincodeRoutes;
}(base_chain_route_1.BaseChainRoute));
exports.ChaincodeRoutes = ChaincodeRoutes;
