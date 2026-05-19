import { NextFunction, Request, Response } from "express";

import { IRefreshTokenRequest, ISignIn } from "../interfaces/auth.interface";
import { authService } from "../services/auth.service";

class AuthController {
    public async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = req.body as ISignIn;
            const result = await authService.SignIn(dto);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = req.body as IRefreshTokenRequest;
            const result = await authService.refresh(dto);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public async getManagerActionInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.getManagerActionInfo(req.params.token);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public async completeManagerAction(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.completeManagerAction(
                req.params.token,
                req.body?.password
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
