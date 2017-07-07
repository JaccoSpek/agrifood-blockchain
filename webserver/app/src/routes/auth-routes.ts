import {Request, Response, Router} from "express";
import {Wallet} from "../wallet/wallet";

export class AuthRoutes {
    private router:Router;
    private wallet:Wallet;

    constructor(router:Router) {
        this.router = router;
        this.wallet = new Wallet();
    }

    public create():void {
        console.log("[AuthRoutes.create] Creating public routes.");

        this.router.post('/auth/login',(req: Request, res: Response) => {
            this.login(req,res);
        });

        this.router.get('/auth/logout',(req: Request, res: Response) => {
            this.logout(req,res);
        });

        this.router.get('/auth/status', (req: Request, res: Response) => {
           this.getAuthStatus(req,res);
        });

        this.router.get('/wallet/roles', (req:Request, res:Response) => {
            this.getMyRoles(req,res);
        });
    }

    private login(req:Request, res:Response):void {
        if(AuthRoutes.authStatus(req)){ // loggedIn
            console.log("Already logged in");
            res.status(400).send("please logout first");
        } else { // not logged in
            if(typeof req.body['username'] == 'undefined' || typeof req.body['password'] == 'undefined'){ // incorect parameters
                console.log("Invalid parameters");
                res.status(400).send("please provide login details");
            } else { // correct parameters
                this.wallet.verifyUser(req.body['username'],req.body['password'])
                    .then(result => {
                        // verify result and login
                        if(result){
                            console.log("Successfully logged in");
                            req.session['userID'] = req.body["username"];
                            res.send("Successfully logged in "+req.body['username']);
                        } else {
                            console.log("Failed to login");
                            res.status(400).send("invalid details")
                        }
                    })
                    .catch(err => {
                        // Some error happened
                        res.status(400).send(err.toString());
                    });
            }
        }
    }

    private logout(req:Request, res:Response):void {
        if(AuthRoutes.authStatus(req)){ // logged in
            req.session['userID'] = null;
            res.send(true);
        } else { // not logged in
            res.status(400).send("not logged in");
        }
    }

    private getAuthStatus(req:Request, res:Response):void {
        let userName:string = AuthRoutes.authStatus(req);
        if(userName){
            res.send(userName);
        } else {
            res.status(400).send("not logged in");
        }
    }

    private getMyRoles(req:Request, res:Response):void {
        let user:string = AuthRoutes.authStatus(req);
        if(user){ // logged in
            this.wallet.getUserIdentities(user)
                .then(result => {
                    let identities:string[] = [];

                    for(let i:number = 0; i < result.length; i++){
                        identities.push( result[i].identity );
                    }

                    res.send(identities);
                })
                .catch(err => {
                    // Some error happened
                    res.status(400).send(err.toString());
                });
        } else { // not logged in
            res.status(400).send("not logged in");
        }
    }

    public static authStatus(req:Request):string {
        if(typeof req.session['userID'] === 'undefined' || req.session['userID'] === null){ // not logged in
            return null;
        } else {
            return req.session['userID'];
        }
    }
}