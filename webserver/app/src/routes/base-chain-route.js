"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hfc = require("hfc");
var BaseChainRoute = (function () {
    function BaseChainRoute(router, chain) {
        this.router = router;
        this.chain = chain;
        this.store = this.chain.getKeyValStore();
    }
    BaseChainRoute.prototype.verifyUser = function (req, cb) {
        var _this = this;
        // check if user is logged in
        if (typeof req.session['enrolledID'] !== 'undefined' && req.session['enrolledID'] !== null) {
            // get user object from chain
            this.chain.getMember(req.session['enrolledID'], function (err, user) {
                if (err) {
                    cb(new Error("Failed to retrieve user"));
                }
                else {
                    // get user tcerts from chain storage
                    _this.store.getValue(req.session['enrolledID'] + "_certs", function (err, certsStr) {
                        if (err) {
                            cb(new Error("Failed to access keyVal store"));
                        }
                        else {
                            var certs = JSON.parse(certsStr);
                            var tcerts = [];
                            for (var i = 0; i < certs.length; i++) {
                                tcerts.push(_this.getTCert(certs[i]));
                            }
                            cb(null, user, tcerts);
                        }
                    });
                }
            });
        }
        else {
            cb(new Error("Please login first"));
        }
    };
    BaseChainRoute.prototype.verifyRequest = function (req, requiredParams, cb) {
        this.verifyUser(req, function (err, user, tcerts) {
            if (err) {
                cb(new Error(err.message));
            }
            else {
                // validate input parameters
                var validRequest = true;
                for (var _i = 0, requiredParams_1 = requiredParams; _i < requiredParams_1.length; _i++) {
                    var param = requiredParams_1[_i];
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
    };
    BaseChainRoute.prototype.verifyQueryRequest = function (req, requiredParams, cb) {
        this.verifyUser(req, function (err, user, tcerts) {
            if (err) {
                cb(new Error(err.message));
            }
            else {
                // validate input parameters
                var validRequest = true;
                for (var _i = 0, requiredParams_2 = requiredParams; _i < requiredParams_2.length; _i++) {
                    var param = requiredParams_2[_i];
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
    };
    BaseChainRoute.prototype.getTCert = function (tcert_object) {
        var privateKey = this.chain.cryptoPrimitives.ecdsaKeyFromPrivate(tcert_object['privateKey']['priv'], 'hex');
        return new hfc.TCert(tcert_object['publicKey'], privateKey);
    };
    BaseChainRoute.prototype.deployChaincode = function (ccPath, args, user, tcert, cb) {
        // construct deploy request
        var deployRequest = {
            fcn: "init",
            args: args,
            userCert: tcert,
            chaincodePath: ccPath,
        };
        console.log("Deploying chaincode..");
        var tx = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.deploy(deployRequest);
        tx.on("complete", function (results) {
            // deploy request completed successfully
            console.log("Deploy completed, chaincodeID: %s", results['chaincodeID']);
            cb(null, results['chaincodeID']);
        });
        tx.on("error", function (error) {
            console.log("Failed to deploy chaincode: request=%j, error=%k", deployRequest, error);
            cb(new Error("Failed to deploy chaincode.."), null);
        });
    };
    BaseChainRoute.prototype.invokeChaincode = function (chaincodeID, fcn, args, user, tcert, cb) {
        var invokeRequest = {
            chaincodeID: chaincodeID,
            fcn: fcn,
            args: args,
            userCert: tcert
        };
        console.log("Invoking function %s on %s", fcn, chaincodeID);
        var tx = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.invoke(invokeRequest);
        tx.on('submitted', function (results) {
            console.log("Invoke submitted successfully; results=%j", results);
        });
        tx.on('complete', function (results) {
            console.log("Invoke completed successfully; results=%j", results);
            cb(null, results);
        });
        tx.on('error', function (error) {
            console.log("Failed to invoke chaincode: request=%j, error=%k", invokeRequest, error);
            cb(new Error("Failed to invoke chaincode"), null);
        });
    };
    BaseChainRoute.prototype.queryChaincode = function (chaincodeID, fcn, args, user, tcert, cb) {
        var queryRequest = {
            chaincodeID: chaincodeID,
            fcn: fcn,
            args: args,
            userCert: tcert
        };
        //console.log("Querying function %s on %s",fcn,chaincodeID);
        var tx = user.newTransactionContext();
        tx.setAttrs(['role']);
        tx.query(queryRequest);
        // listen for events
        tx.on('complete', function (data) {
            var result = data.result.toString();
            //console.log("Query completed successfully; results=%s", result);
            cb(null, result);
        });
        tx.on('error', function (error) {
            console.log("Failed to query chaincode: request=%j, error=%k", queryRequest, error);
            cb(error, null);
        });
    };
    return BaseChainRoute;
}());
exports.BaseChainRoute = BaseChainRoute;
