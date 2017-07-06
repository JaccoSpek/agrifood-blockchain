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

    // verify user
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
}