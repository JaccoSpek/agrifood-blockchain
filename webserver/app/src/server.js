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
var ab_routes_1 = require("./routes/ab-routes");
var cb_routes_1 = require("./routes/cb-routes");
var farm_routes_1 = require("./routes/farm-routes");
var auditor_routes_1 = require("./routes/auditor-routes");
var trader_routes_1 = require("./routes/trader-routes");
var public_routes_1 = require("./routes/public-routes");
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
        var abRoutes = new ab_routes_1.ABRoutes(router, this.chain);
        abRoutes.create();
        var cbRoutes = new cb_routes_1.CBRoutes(router, this.chain);
        cbRoutes.create();
        var farmRoutes = new farm_routes_1.FarmRoutes(router, this.chain);
        farmRoutes.create();
        var auditorRoutes = new auditor_routes_1.AuditorRoutes(router, this.chain);
        auditorRoutes.create();
        var traderRoutes = new trader_routes_1.TraderRoutes(router, this.chain);
        traderRoutes.create();
        var publicRoutes = new public_routes_1.PublicRoutes(router, this.chain);
        publicRoutes.create();
        // Router middleware
        this.app.use(router);
    };
    return Server;
}());
exports.Server = Server;
