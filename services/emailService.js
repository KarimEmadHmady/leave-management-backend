import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

    const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
    pool: true,
    tls: {
        rejectUnauthorized: false,  
    },
    port: 587,
    secure: false,  
    });

    export const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: `"UWD" <${process.env.EMAIL_USER}>`, 
        to: to,
        subject: subject,
        text: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        console.log('Error sending email:', error);
        } else {
        console.log('Email sent:', info.response);
        }
        transporter.close();
    });
    };
