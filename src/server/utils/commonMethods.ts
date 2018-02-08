import * as fs from "fs";
import * as os from "os";

export function isset(param: any) {
    return !(param === null || param === "" || param === undefined);
}

export function isProduction(): boolean {
    return process.env.APP_ENV.toLocaleLowerCase() === "production";
}

export function isDevelopment(): boolean {
    return process.env.APP_ENV.toLocaleLowerCase() === "development";
}

export function sslKeyExists(returnPath?: boolean): string | boolean {
    const keyPath = process.env.SSL_KEY_PATH || os.homedir() + "/.ssl/privatekey.key";
    const exists = fs.existsSync(keyPath);
    return exists && returnPath ? keyPath : exists;
}

export function sslCertExists(returnPath?: boolean): string | boolean {
    const certPath = process.env.SSL_CERT_PATH || os.homedir() + "/.ssl/certificate.crt";
    const exists = fs.existsSync(certPath);
    return exists && returnPath ? certPath : exists;
}

export function env(param: string, defaultValue = false) {
    return process.env[param] || defaultValue;
}
