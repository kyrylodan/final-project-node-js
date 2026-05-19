import { Router } from "express";

import {
    createManager,
    createManagerActivationLink,
    createManagerRecoveryLink,
    getApplicationStatistics,
    getManagers,
    updateManagerBanStatus,
} from "../controller/admin.controller";
import { commonMiddleware } from "../middlewares/common.middleware";

const router = Router();

router.get(
    "/stats",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin"]),
    getApplicationStatistics
);

router.get(
    "/managers",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin"]),
    getManagers
);

router.post(
    "/managers",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin"]),
    createManager
);

router.post(
    "/managers/:id/activate-link",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin"]),
    createManagerActivationLink
);

router.post(
    "/managers/:id/recovery-link",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin"]),
    createManagerRecoveryLink
);

router.patch(
    "/managers/:id/ban",
    commonMiddleware.checkAccessToken,
    commonMiddleware.checkRole(["admin"]),
    updateManagerBanStatus
);

export default router;
