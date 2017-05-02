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

import { EnrollRoutes } from "./routes/enroll-routes";
import { ChaincodeRoutes } from "./routes/chaincode-routes";

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
            cookie: {maxAge: 600000}
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
        this.chain.setDeployWaitTime(30);
        this.chain.setInvokeWaitTime(10);
        this.chain.setKeyValStore( hfc.newFileKeyValStore('/tmp/keyValStore') );
    }

    public api() {
        let router: express.Router;
        router = express.Router();

        let enrollRoutes = new EnrollRoutes(router,this.chain);
        enrollRoutes.create();

        let ccRoutes = new ChaincodeRoutes(router,this.chain);
        ccRoutes.create();

        // Router middleware
        this.app.use(router);
    }
}