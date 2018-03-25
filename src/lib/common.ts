import * as os from "os";
import { Config } from "../lib/Config";
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

export function stripHtml(html): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
}

export function env(param: string, defaultValue: any = false) {
    return process.env[param] || defaultValue;
}
