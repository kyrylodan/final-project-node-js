import { Router } from "express";

import { authController } from "../controller/auth.controller";

const router = Router();

router.post("/sign-in", authController.signIn);
router.get("/activate/:token", authController.getManagerActionInfo);
router.post("/activate/:token", authController.completeManagerAction);

export const authRouter = router;
