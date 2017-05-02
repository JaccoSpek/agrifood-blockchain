import { Server } from './server';
import * as http from 'http';
import * as debug from 'debug';
import * as express from 'express';

let httpPort:number = normalizePort(process.env.PORT || 8080);
let app: express.Application = Server.bootstrap().app;
app.set("port", httpPort);
let httpServer:http.Server = http.createServer(app);

//listen on provided ports
httpServer.listen(httpPort);

//add error handler
httpServer.on("error", onError);

//start listening on port
httpServer.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val:string):any {
    let port:number = Number(val);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    let bind = typeof httpPort === "string"
        ? "Pipe " + httpPort
        : "Port " + httpPort;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening():void {
    let addr:{ port: number; family: string; address: string; } = httpServer.address();
    let bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    debug("Listening on " + bind);
}