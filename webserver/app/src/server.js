"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const hfc = require("hfc");
const errorHandler = require("errorhandler");
const methodOverride = require("method-override");
const enroll_routes_1 = require("./routes/enroll-routes");
const chaincode_routes_1 = require("./routes/chaincode-routes");
const admin_routes_1 = require("./routes/admin-routes");
const ab_routes_1 = require("./routes/ab-routes");
const cb_routes_1 = require("./routes/cb-routes");
const farm_routes_1 = require("./routes/farm-routes");
const auditor_routes_1 = require("./routes/auditor-routes");
const trader_routes_1 = require("./routes/trader-routes");
const public_routes_1 = require("./routes/public-routes");
const user_routes_1 = require("./routes/user-routes");
class Server {
    static bootstrap() {
        return new Server();
    }
    constructor() {
        // create expressjs application
        this.app = express();
        // configure application
        this.config();
        // configure chain
        this.configChain();
        // add api
        this.api();
    }
    config() {
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
            cookie: { maxAge: 6000000 }
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
    }
    configChain() {
        let PEER_ADDRESS = process.env.PEER_ADDRESS;
        let MEMBERSRVC_ADDRESS = process.env.MEMBERSRVC_ADDRESS;
        this.chain = hfc.getChain("chain", true);
        // config chain
        this.chain.setMemberServicesUrl("grpc://" + MEMBERSRVC_ADDRESS);
        this.chain.addPeer("grpc://" + PEER_ADDRESS);
        this.chain.setDevMode(false);
        this.chain.setDeployWaitTime(Number(process.env.DEPLOY_WAITTIME || 30));
        this.chain.setInvokeWaitTime(Number(process.env.INVOKE_WAITTIME || 10));
        this.chain.setKeyValStore(hfc.newFileKeyValStore('/tmp/keyValStore'));
    }
    api() {
        let router;
        router = express.Router();
        let userRoutes = new user_routes_1.UserRoutes(router);
        userRoutes.create();
        let enrollRoutes = new enroll_routes_1.EnrollRoutes(router, this.chain);
        enrollRoutes.create();
        let ccRoutes = new chaincode_routes_1.ChaincodeRoutes(router, this.chain);
        ccRoutes.create();
        let adminRoutes = new admin_routes_1.AdminRoutes(router, this.chain);
        adminRoutes.create();
        let abRoutes = new ab_routes_1.ABRoutes(router, this.chain);
        abRoutes.create();
        let cbRoutes = new cb_routes_1.CBRoutes(router, this.chain);
        cbRoutes.create();
        let farmRoutes = new farm_routes_1.FarmRoutes(router, this.chain);
        farmRoutes.create();
        let auditorRoutes = new auditor_routes_1.AuditorRoutes(router, this.chain);
        auditorRoutes.create();
        let traderRoutes = new trader_routes_1.TraderRoutes(router, this.chain);
        traderRoutes.create();
        let publicRoutes = new public_routes_1.PublicRoutes(router, this.chain);
        publicRoutes.create();
        // Router middleware
        this.app.use(router);
    }
}
exports.Server = Server;
