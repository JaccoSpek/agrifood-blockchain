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
            try{
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
}