import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";

import { configs } from "./src/configs/config";
import { openApiDocument } from "./src/docs/openapi";
import adminRouter from "./src/routes/admin.router";
import { authRouter } from "./src/routes/auth.router";
import applicationsRouter from "./src/routes/applications.router";
import { userRepository } from "./src/repositories/user.repositories";
import { passwordService } from "./src/services/password.service";

dotenv.config();

const app = express();

app.use(express.json());
app.use(fileUpload({ createParentPath: true }));
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    })
);

app.use("/api/applications", applicationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.get("/api/docs.json", (req, res) => {
    res.status(200).json(openApiDocument);
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    res.status(status).json({ message });
});

async function createDefaultAdmin() {
    const existingAdmin = await userRepository.getByEmail("admin@gmail.com");

    if (!existingAdmin) {
        const hashedPassword = await passwordService.hashPassword("admin");

        await userRepository.create({
            name: "Admin",
            surname: "Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin",
            isActive: true,
            isBanned: false,
            course_type: "none",
            course_format: "none",
            course: "none",
            age: 0,
            phone: "0000000000",
        });

        console.log("Default admin created");
    }
}

mongoose
    .connect(configs.MONGO_URI)
    .then(async () => {
        console.log("MongoDB connected");
        await createDefaultAdmin();
        app.listen(configs.APP_PORT, () => {
            console.log(`Server running at http://${configs.APP_HOST}:${configs.APP_PORT}`);
        });
    })
    .catch((error) => console.error("MongoDB connection error:", error));
