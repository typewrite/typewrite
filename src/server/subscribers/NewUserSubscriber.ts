import * as nodeMailer from "nodemailer";
import {EntitySubscriberInterface, InsertEvent, EventSubscriber} from "typeorm";
import * as logger from "winston";
import {User} from "../models/User";
import Server from "../Server";
import * as nunjucks from "nunjucks";
import { ConfigPromise } from "../utils/Config";

@EventSubscriber()
export class NewUserSubscriber implements EntitySubscriberInterface <User> {

    public listenTo() {
        return User;
    }

    public async afterInsert(event: InsertEvent<User>) {
        logger.info("New User Subscriber Initiated.");
        const config = await ConfigPromise;
        logger.log("debug", "SMTP Config used: ", config.get("smtp"));
        const mailer = nodeMailer.createTransport(config.get("smtp") as any);
        const tplEngine = nunjucks;
        const serverAddress = Server.server.address().address;
        const user = event.entity;
        const tplData = {
            user: {
                name: user.firstName,
            },
            confirmationLink: serverAddress + "/api/v1/verifyUser/" + user.createEmailVerifyToken().emailVerifyToken,
            brand: {
                name: process.env.BRAND_NAME || "TypeWrite",
                logo: "TypeWrite",
            },
        };

        const emailHtml = tplEngine.render("emails/VerifyUserEmail.html", tplData);

        mailer.sendMail({
            from: "juz.cool1@gmail.com",
            to: user.email,
            subject: "Please Verify your Email",
            html: emailHtml,
        }).then(() => {
            logger.info("Email Sent successfully.");
        }).catch((error) => {
            logger.warn("Sent Email failed. Reason:" + error.message);
        });
    }
}
