import { Router,Request,Response } from "express";
import Mariadb = require("mariasql");

export class UserRoutes {
    private router:Router;
    private db_client;


    constructor(router:Router){
        this.router = router;
        this.db_client = new Mariadb({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        });
    }

    public create():void {
        //log
        console.log("[UserRoutes.create] Creating user routes.");

        this.router.post("/login", (req:Request,res:Response) => {
            this.login(req,res);
        });
    }

    private login(req:Request,res:Response):void {
        console.log("Login");
        this.db_client.query('SHOW DATABASES', null, {useArray:true}, (err:Error, rows:any) => {
            if(err){
                throw err;
            } else {
                console.log(rows);
            }
        });
        res.send(true);
    }
}
