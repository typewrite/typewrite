import * as nodeMailer from "nodemailer";
import {EntitySubscriberInterface, InsertEvent} from "typeorm";
import * as logger from "winston";
import {User} from "../models/User";
import App from "../Server";

let mailerConfig = {};
const isMailSecure = process.env.SMTP_PORT === "465";
if (process.env.SMTP_TYPE === "sendmail") {
    mailerConfig = {
        sendmail: true,
        newline: "unix",
    };
} else {
    mailerConfig = {
        host: process.env.SMTP_HOST || "localhost",
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE || isMailSecure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    };
}

export class NewUserSubscriber implements EntitySubscriberInterface<User> {

    public listenTo() {
        return User;
    }

    public afterInsert(event: InsertEvent<User>): void {
        logger.info("New User Subscriber Initiated.");

        const mailer = nodeMailer.createTransport(mailerConfig);
        const tplEngine = App.server.tplEngine;
        const serverAddress = App.server.address().address;
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
            from: "typewrite@typewrite.in",
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
