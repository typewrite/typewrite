import * as os from "os";
import { Config } from "../utils/Config";
import { resolve } from "path";

export function isset(param: any) {
    return !(param === null || param === "" || param === undefined);
}

export function isProduction(): boolean {
    return process.env.APP_ENV.toLocaleLowerCase() === "production";
}

export function isDevelopment(): boolean {
    return process.env.APP_ENV.toLocaleLowerCase() === "development";
}

export function basePath(path: string): string {
    return resolve(Config.instance.get("srcPath") + "../" + path);
}

export function srcPath(path: string): string {
    return resolve(Config.instance.get("srcPath") + path);
}

export function serverPath(path: string): string {
    return resolve(Config.instance.get("serverPath") + path);
}

export function homeDirPath(path): string {
    return resolve(os.homedir() + path);
}

export function boolVal(val): boolean {
    return (/true/i).test(val);
}

// export function sslKeyExists(returnPath?: boolean): string | boolean {
//     const keyPath = process.env.SSL_KEY_PATH || os.homedir() + "/.ssl/privatekey.key";
//     const exists = fs.existsSync(keyPath);
//     return exists && returnPath ? keyPath : exists;
// }

// export function sslCertExists(returnPath?: boolean): string | boolean {
//     const certPath = process.env.SSL_CERT_PATH || os.homedir() + "/.ssl/certificate.crt";
//     const exists = fs.existsSync(certPath);
//     return exists && returnPath ? certPath : exists;
// }

export function env(param: string, defaultValue = false) {
    return process.env[param] || defaultValue;
}
