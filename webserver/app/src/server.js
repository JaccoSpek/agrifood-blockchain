"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var express = require("express");
var cors = require("cors");
var logger = require("morgan");
var hfc = require("hfc");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var enroll_routes_1 = require("./routes/enroll-routes");
var chaincode_routes_1 = require("./routes/chaincode-routes");
var admin_routes_1 = require("./routes/admin-routes");
var party_routes_1 = require("./routes/party-routes");
var shippingline_routes_1 = require("./routes/shippingline-routes");
var stevedore_routes_1 = require("./routes/stevedore-routes");
var forwarder_routes_1 = require("./routes/forwarder-routes");
var bank_routes_1 = require("./routes/bank-routes");
var carrier_routes_1 = require("./routes/carrier-routes");
var customs_routes_1 = require("./routes/customs-routes");
var consignee_routes_1 = require("./routes/consignee-routes");
var Server = (function () {
    function Server() {
        // create expressjs application
        this.app = express();
        // configure application
        this.config();
        // configure chain
        this.configChain();
        // add api
        this.api();
    }
    Server.bootstrap = function () {
        return new Server();
    };
    Server.prototype.config = function () {
        // use logger middleware
        this.app.use(logger("dev"));
        this.app.use(cors({
            origin: process.env.FRONTEND_ORIGIN,
            credentials: true
        }));
        // use json form parser middleware
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        // use cookie parker middleware
        this.app.use(cookieParser());
        this.app.use(session({
            secret: "SECRET",
            resave: false,
            saveUninitialized: true,
            cookie: { maxAge: 600000 }
        }));
        // use override middleware
        this.app.use(methodOverride());
        // catch 404's
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        // error handling
        this.app.use(errorHandler());
    };
    Server.prototype.configChain = function () {
        var PEER_ADDRESS = process.env.PEER_ADDRESS;
        var MEMBERSRVC_ADDRESS = process.env.MEMBERSRVC_ADDRESS;
        this.chain = hfc.getChain("chain", true);
        // config chain
        this.chain.setMemberServicesUrl("grpc://" + MEMBERSRVC_ADDRESS);
        this.chain.addPeer("grpc://" + PEER_ADDRESS);
        this.chain.setDevMode(false);
        this.chain.setDeployWaitTime(30);
        this.chain.setInvokeWaitTime(10);
        this.chain.setKeyValStore(hfc.newFileKeyValStore('/tmp/keyValStore'));
    };
    Server.prototype.api = function () {
        var router;
        router = express.Router();
        var enrollRoutes = new enroll_routes_1.EnrollRoutes(router, this.chain);
        enrollRoutes.create();
        var ccRoutes = new chaincode_routes_1.ChaincodeRoutes(router, this.chain);
        ccRoutes.create();
        var adminRoutes = new admin_routes_1.AdminRoutes(router, this.chain);
        adminRoutes.create();
        var partyRoutes = new party_routes_1.PartyRoutes(router, this.chain);
        partyRoutes.create();
        var shippinglineRoutes = new shippingline_routes_1.ShippinglineRoutes(router, this.chain);
        shippinglineRoutes.create();
        var stevedoreRoutes = new stevedore_routes_1.StevedoreRoutes(router, this.chain);
        stevedoreRoutes.create();
        var forwarderRoutes = new forwarder_routes_1.ForwarderRoutes(router, this.chain);
        forwarderRoutes.create();
        var bankRoutes = new bank_routes_1.BankRoutes(router, this.chain);
        bankRoutes.create();
        var carrierRoutes = new carrier_routes_1.CarrierRoutes(router, this.chain);
        carrierRoutes.create();
        var customsRoutes = new customs_routes_1.CustomsRoutes(router, this.chain);
        customsRoutes.create();
        var consigneeRoutes = new consignee_routes_1.ConsigneeRoutes(router, this.chain);
        consigneeRoutes.create();
        // Router middleware
        this.app.use(router);
    };
    return Server;
}());
exports.Server = Server;
