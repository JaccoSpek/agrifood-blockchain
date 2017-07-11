import Mariadb = require("mariasql");
import FS = require("fs");
import * as bcrypt from 'bcrypt-nodejs';
import { Wallet } from './wallet/wallet'

console.log("Verifying wallet database state..");
try{
    let client = new Mariadb({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        db: process.env.DATABASE_NAME
    });

    // verify DB state
    client.query('SHOW DATABASES', null, {useArray:true}, (err:Error, rows:any) => {
        if(err){
            throw err;
        } else {
            if(rows && rows.length > 0){
                rows.forEach(row => {
                    if(row == process.env.DATABASE_NAME){
                        console.log("DB found: %s",row);
                        // DB found, now verify table(s)
                        client.query('SHOW TABLES', null, {useArray:true}, (err:Error, rows:any) => {
                            if(err){
                                throw err;
                            } else {
                                let users_table:boolean = false;
                                let identities_table:boolean = false;
                                if(rows && rows.length > 0) {
                                    rows.forEach(row => {
                                       if(row == 'users') {
                                           console.log("users table found");
                                           users_table = true;
                                       } else if(row == 'identities'){
                                           console.log("identities table found");
                                           identities_table = true;
                                       }

                                    });
                                }

                                if(!users_table || !identities_table) {
                                    console.log("not all tables found, load init script..");
                                    // load init sql script
                                    FS.readFile(process.env.INIT_SQL_FILE,'utf8',(err:Error,initSQL:string)=>{
                                        if(err){
                                            throw err;
                                        } else {
                                            // Execute init script
                                            console.log("execute init script..");
                                            // split file into array with statements
                                            let queries = initSQL.split(/;[\r\n]*/);

                                            // filter out empty queries
                                            queries = queries.filter((query) => {
                                                return query.length > 1;
                                            });

                                            // now execute queries
                                            execQueries(queries,0,(err)=>{
                                                if(err){
                                                    throw err;
                                                } else {
                                                    console.log("Successfully executed queries, insert user..");

                                                    let wallet:Wallet = new Wallet();
                                                    wallet.addUser(process.env.ADMIN_USERNAME,process.env.ADMIN_PASSWORD,"admin")
                                                        .then(result => {
                                                            console.log("Successfully added user");
                                                        })
                                                        .catch(err => {
                                                            console.log("Error creating user: %s",err.toString());
                                                        });
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    console.log("tables exists, exit");
                                }

                            }
                        });
                    }
                });
            }
        }
    });
    client.end();
}
catch (err){
    console.log("Error:",err);
}

function execQueries(queries:any[], idx:number, cb:Function):void {
    if(queries.length > idx){
        try{
            // mysql client
            let client = new Mariadb({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                db: process.env.DATABASE_NAME
            });

            //console.log("run query %d",idx);
            client.query(queries[idx],null,(err:Error, result:any) => {
                client.end();
                if(err){
                    throw err;
                } else {
                    // run next query:
                    //console.log("finished query %d",idx);
                    execQueries(queries,idx+1,cb);
                }
            });
        } catch (err){
            let msg:string = "Initialization failed: " + err.toString();
            console.log(msg);
            cb(new Error(msg));
        }
    } else {
        // done, run callback
        //console.log("done");
        cb(null);
    }
}