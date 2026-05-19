import { Router } from "express";

import {
    addApplicationComment,
    exportApplications,
    getAllApplications,
    updateApplication,
} from "../controller/applications.controller";
import { commonMiddleware } from "../middlewares/common.middleware";

const router = Router();

router.get(
    "/",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin", "manager"]),
    getAllApplications
);

router.get(
    "/export",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin", "manager"]),
    exportApplications
);

router.patch(
    "/:id",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin", "manager"]),
    updateApplication
);

router.patch(
    "/:id/comment",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin", "manager"]),
    addApplicationComment
);

export default router;
