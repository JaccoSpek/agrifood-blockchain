import Mariadb = require("mariasql");

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
                                       if(row == 'Users') {
                                           console.log("users table found");
                                           users_table = true;
                                       } else if(row == 'Identities'){
                                           console.log("identities table found");
                                           identities_table = true;
                                       }

                                    });
                                }

                                if(!users_table || !identities_table) {
                                    console.log("not all tables found, create table..");
                                    // TODO: load init sql script
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