import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!EMAIL_USER || !EMAIL_PASS) {
        throw new Error("Email credentials missing. Check EMAIL_USER and EMAIL_PASS.");
    }
    const mailOptions = {
        from: `Mero app <${EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
}