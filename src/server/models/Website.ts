import * as typeOrm from "typeorm";
import { BaseModel } from "./BaseModel";

@typeOrm.Entity("website")
export class Website extends BaseModel {

    @typeOrm.PrimaryGeneratedColumn()
    public id: number;

    @typeOrm.Column()
    public name: string;

    @typeOrm.Column()
    public domainName: string;

    @typeOrm.Column()
    public isSecure: boolean;

    public getBaseUrl(path = ""): string {
        if (this.domainName === "") {
            return path;
        }
        return (this.isSecure ? "https://" : "http://") + this.domainName + "/" + path;
    }
}
