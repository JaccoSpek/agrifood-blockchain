import Mariadb = require("mariasql");
import * as bcrypt from 'bcrypt-nodejs';

export class Wallet {
    private dbConfig:object;

    constructor(){
        this.dbConfig = {
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            db: process.env.DATABASE_NAME
        };
    }

    // add user to DB
    public addUser(username:string, password:string, role:string):Promise<boolean> {
        return new Promise((resolve,reject) => {
            try {
                let client = new Mariadb(this.dbConfig);

                client.query('INSERT INTO users (username, passhash, role) VALUES(:username, :passhash, :role)', {
                    username: username,
                    passhash: bcrypt.hashSync(password),
                    role: role
                }, (err:Error) => {
                    client.end();
                    if(err){
                        throw err
                    } else {
                        resolve(true);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // verify username/password
    public verifyUser(username:string, password:string):Promise<boolean>{
        return new Promise((resolve, reject) =>{
            try {
                let client = new Mariadb(this.dbConfig);

                client.query('SELECT id,passhash FROM users WHERE username=:username',{
                    username: username
                }, (err:Error,result:any[]) => {
                    client.end();
                    if(err){
                        throw err;
                    } else {
                        // verify user
                        if(result.length) { //user found
                            // verify password
                            if(bcrypt.compareSync(password,result[0].passhash)){
                                // password correct
                                resolve(true);
                            } else {
                                // password incorrect
                                resolve(false);
                            }
                        } else { // user not found
                            resolve(false);
                        }
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // get user role
    public getUserRole(username:string):Promise<string> {
        return new Promise((resolve,reject) => {
            try {
                let client = new Mariadb(this.dbConfig);

                client.query('SELECT id,role FROM users WHERE username=:username',{
                    username: username
                },(err:Error,result:any[])=>{
                    client.end();
                    if(err){
                        throw err;
                    } else {
                        if(result.length) {
                            resolve(result[0].role);
                        } else {
                            reject(new Error("User not found"));
                        }
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    // add identity to user
    public addIdentity(username:string, identity:string):Promise<boolean>{
        return new Promise((resolve, reject) => {
            try {
                let client = new Mariadb(this.dbConfig);

                client.query('INSERT INTO identities (user_id, identity) VALUES((SELECT id FROM users WHERE username=:username), :identity)',{
                    username:username,
                    identity:identity
                }, (err:Error) => {
                    client.end();
                    if(err){
                        throw err
                    } else {
                        resolve(true);
                    }
                });

            } catch (err) {
                reject(err);
            }
        });
    }

    // get registered identities
    public getRegisteredIdentities():Promise<any[]> {
        return new Promise((resolve, reject) => {
            try {
                let client = new Mariadb(this.dbConfig);

                client.query('SELECT users.username, identities.identity FROM identities,users WHERE users.id = identities.user_id',null,(err:Error,result:any[]) => {
                    if(err){
                        throw err;
                    } else {
                        resolve(result);
                    }
                })
            } catch (err) {
                reject(err);
            }
        });
    }

    // get identities registered to user
    public getUserIdentities(username:string):Promise<any[]> {
        return new Promise((resolve, reject) => {
            try {
                let client = new Mariadb(this.dbConfig);

                client.query('SELECT identities.identity FROM identities,users WHERE users.id = identities.user_id AND users.username=:username',{
                    username:username
                },(err:Error,result:any[]) => {
                    if(err){
                        throw err;
                    } else {
                        resolve(result);
                    }
                })
            } catch (err) {
                reject(err);
            }
        })
    }

    // add address to user
    public addAddress(username:string, address:string):Promise<boolean>{
        return new Promise((resolve, reject) => {
            try {
                this.getUserAddresses(username)
                    .then(addresses => {
                        if(addresses.indexOf(address) < 0) {
                            let client = new Mariadb(this.dbConfig);
                            client.query('INSERT INTO addresses (user_id, address) VALUES((SELECT id FROM users WHERE username=:username), :address)',{
                                username:username,
                                address:address
                            }, (err:Error) => {
                                client.end();
                                if(err){
                                    throw err
                                } else {
                                    resolve(true);
                                }
                            });
                        } else {
                            console.log("Address exists");
                            resolve(false);
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });

            } catch (err) {
                reject(err);
            }
        });
    }

    // get identities registered to user
    public getUserAddresses(username:string):Promise<any[]> {
        return new Promise((resolve, reject) => {
            try {
                let client = new Mariadb(this.dbConfig);

                client.query('SELECT addresses.address FROM addresses,users WHERE users.id = addresses.user_id AND users.username=:username',{
                    username:username
                },(err:Error,result:any[]) => {
                    if(err){
                        throw err;
                    } else {
                        resolve(result);
                    }
                })
            } catch (err) {
                reject(err);
            }
        })
    }

}