import dotenv from "dotenv";
import {ObjectCannedACL} from "@aws-sdk/client-s3";
dotenv.config();
export const configs = {
    APP_PORT: Number(process.env.APP_PORT) || 3000,
    APP_HOST: process.env.APP_HOST || "localhost",
    MONGO_URI: process.env.MONGO_URI ||  "mongodb://localhost:27017/mydatabase",


    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION as string,

    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,

    SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
    SMTP_EMAIL:process.env.SMTP_EMAIL as string,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    MANAGER_EMAIL: process.env.MANAGER_EMAIL as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    AWS_ACCESS_KEY:process.env.AWS_ACCESS_KEY,
    AWS_SECRET_KEY:process.env.AWS_SECRET_KEY,
    AWS_S3_BUCKET_NAME:process.env.AWS_S3_BUCKET_NAME,
    AWS_S3_REGION:process.env.AWS_S3_REGION,
    AWS_S3_ACL:process.env.AWS_S3_ACL as ObjectCannedACL,
    AWS_S3_ENDPOINT:process.env.AWS_S3_ENDPOINT

};
