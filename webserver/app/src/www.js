"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const http = require("http");
const debug = require("debug");
let httpPort = normalizePort(process.env.PORT || 8080);
let app = server_1.Server.bootstrap().app;
app.set("port", httpPort);
let httpServer = http.createServer(app);
//listen on provided ports
httpServer.listen(httpPort);
//add error handler
httpServer.on("error", onError);
//start listening on port
httpServer.on("listening", onListening);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = Number(val);
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
function onListening() {
    let addr = httpServer.address();
    let bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    debug("Listening on " + bind);
}
