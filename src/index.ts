import * as debug from "debug";
import * as http from "http";

import App from "./server/Server";

debug("ts-express:server");

const port = normalizePort(process.env.PORT || 3000);
App.set("port", port);

const server = http.createServer(App);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: number | string): number | string | boolean {
    const truePort: number = (typeof val === "string") ? parseInt(val, 10) : val;
    if (isNaN(truePort)) {
        return val;
    } else if (truePort >= 0) {
        return truePort;
    } else {
        return false;
    }
}

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = (typeof port === "string") ? "Pipe " + port : "Port " + port;
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening(): void {
    const address = server.address();
    const bind = (typeof address === "string") ? `pipe ${address}` : `port ${address.port}`;
    console.log(`Listening on ${bind}`);
}
