import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as express from "express";
import * as cors from "cors";
import * as logger from "morgan";
import * as hfc from 'hfc';
import {Chain} from "hfc/lib/hfc";

import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import MariaSql = require("mariasql");

import { EnrollRoutes } from "./routes/enroll-routes";
import { ChaincodeRoutes } from "./routes/chaincode-routes";
import { AdminRoutes } from "./routes/admin-routes";
import { ABRoutes } from "./routes/ab-routes";
import { CBRoutes } from "./routes/cb-routes";
import { FarmRoutes } from "./routes/farm-routes";
import { AuditorRoutes } from "./routes/auditor-routes";
import { TraderRoutes } from "./routes/trader-routes";
import { PublicRoutes } from "./routes/public-routes";

export class Server {
    protected chain:Chain;

    public app: express.Application;

    public static bootstrap(): Server {
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

    public config():void {
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
            cookie: {maxAge: 6000000}
        }));

        // use override middleware
        this.app.use(methodOverride());
        
        // catch 404's
        this.app.use(function (err:any, req:express.Request, res:express.Response, next: express.NextFunction) {
            err.status = 404;
            next(err);
        });

        // error handling
        this.app.use(errorHandler());
    }

    public configChain():void {
        let PEER_ADDRESS        = process.env.PEER_ADDRESS;
        let MEMBERSRVC_ADDRESS  = process.env.MEMBERSRVC_ADDRESS;

        this.chain = hfc.getChain("chain",true);

        // config chain
        this.chain.setMemberServicesUrl("grpc://"+MEMBERSRVC_ADDRESS);
        this.chain.addPeer("grpc://"+PEER_ADDRESS);
        this.chain.setDevMode(false);
        this.chain.setDeployWaitTime(Number(process.env.DEPLOY_WAITTIME || 30));
        this.chain.setInvokeWaitTime(Number(process.env.INVOKE_WAITTIME || 10));
        this.chain.setKeyValStore( hfc.newFileKeyValStore('/tmp/keyValStore') );
    }

    public api() {
        let router: express.Router;
        router = express.Router();

        let enrollRoutes = new EnrollRoutes(router,this.chain);
        enrollRoutes.create();

        let ccRoutes = new ChaincodeRoutes(router,this.chain);
        ccRoutes.create();

        let adminRoutes = new AdminRoutes(router, this.chain);
        adminRoutes.create();

        let abRoutes = new ABRoutes(router, this.chain);
        abRoutes.create();

        let cbRoutes = new CBRoutes(router, this.chain);
        cbRoutes.create();

        let farmRoutes = new FarmRoutes(router, this.chain);
        farmRoutes.create();

        let auditorRoutes = new AuditorRoutes(router, this.chain);
        auditorRoutes.create();

        let traderRoutes = new TraderRoutes(router, this.chain);
        traderRoutes.create();

        let publicRoutes = new PublicRoutes(router, this.chain);
        publicRoutes.create();

        // Router middleware
        this.app.use(router);
    }
}