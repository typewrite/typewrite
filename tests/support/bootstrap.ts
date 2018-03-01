import Server from "../../src/server/Server";
import chalk from "chalk";

process.env.NODE_ENV = "test";
console.log(chalk.green("Initiating Test Server..."));

// const server = Server.createServer();
// server.then((app) => {
//     (global as any).app = app;
//     app.run();
//     console.log(chalk.green("Initiating Test Database..."));
//     try {
//         app.dbConnected.then((dbConnection) => {
//             (global as any).dbConnection = dbConnection;

//             dbConnection.undoLastMigration().then((res) => {
//                 dbConnection.runMigrations()
//                     .catch((err) => {
//                         console.log("runMigration failed: ", err);
//                     });
//             })
//             .catch((err) => {
//                 console.log("Database revertion failed: ", err);
//             });
//         })
//         .catch((err) => {
//             console.log("Database connection failed: ", err);
//         });
//     } catch (e) {
//         console.log("Error: ", e);
//     }

// });

Server.boot();
