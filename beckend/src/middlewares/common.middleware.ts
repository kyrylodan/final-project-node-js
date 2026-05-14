import {ObjectSchema} from "joi";
import {NextFunction, Request, Response} from "express";
import {ApiError} from "../errors/api.error";
import {tokenService} from "../services/token.service";
import {TokenTypeEnum} from "../enums/token-type.enum";
import {tokenRepository} from "../repositories/token.repositories";
import {userRepository} from "../repositories/user.repositories";

class CommonMiddleware {

    public isBodyValid(validator:ObjectSchema) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = await validator.validateAsync(req.body);
                next();
            } catch (e: any) {
                next(new ApiError(e.details[0].message, 400));
            }
        }


    }

    public checkAccessToken(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                throw new ApiError("Token is required", 401);
            }

            const [bearer, accessToken] = authHeader.split(" ");

            if (bearer !== "Bearer" || !accessToken) {
                throw new ApiError("Invalid token format", 401);
            }

            const tokenPayload = tokenService.verifyToken(accessToken, TokenTypeEnum.ACCESS);

            tokenRepository.findByParams({ accessToken })
                .then(async (tokenFromDb) => {
                    if (!tokenFromDb) {
                        return next(new ApiError("Invalid token", 401));
                    }

                    const currentUser = await userRepository.getById(tokenPayload.userId);

                    if (!currentUser) {
                        return next(new ApiError("User not found", 401));
                    }

                    if (currentUser.isBanned) {
                        return next(new ApiError("User is banned", 401));
                    }

                    if (tokenPayload.role === "manager" && !currentUser.isActive) {
                        return next(new ApiError("User is not activated", 401));
                    }

                    res.locals.tokenPayload = tokenPayload;
                    next();
                })
                .catch((error) => next(error));
        } catch (e) {
            next(e);
        }
    }

    public checkRole(roles: string[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            const { tokenPayload } = res.locals;
            const isLegacyRoleId =
                typeof tokenPayload?.role === "string" && /^[a-f\d]{24}$/i.test(tokenPayload.role);

            if (!tokenPayload) {
                return next(new ApiError("Unauthorized", 401));
            }

            if (!roles.includes(tokenPayload.role) && !isLegacyRoleId) {
                return next(new ApiError("Forbidden", 403));
            }

            next();
        };
    }


}
export const commonMiddleware = new CommonMiddleware();
