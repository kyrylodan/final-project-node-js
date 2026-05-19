import {IManagerActionTokenPayload, ITokenPair, ITokenPayload} from "../interfaces/token.interface";
import {configs} from "../configs/config";
import jwt, { SignOptions } from "jsonwebtoken";
import {TokenTypeEnum} from "../enums/token-type.enum";
import {ApiError} from "../errors/api.error";

class TokenServise {
    public generateTokens(payload: ITokenPayload): ITokenPair {
        const accessToken = jwt.sign(payload, configs.JWT_ACCESS_SECRET, {
            expiresIn: configs.JWT_ACCESS_EXPIRATION as SignOptions["expiresIn"],
        });
        const refreshToken = jwt.sign(payload, configs.JWT_REFRESH_SECRET, {
            expiresIn: configs.JWT_REFRESH_EXPIRATION as SignOptions["expiresIn"],
        });

        return { accessToken, refreshToken };
    }

    public verifyToken(token: string, type: TokenTypeEnum): ITokenPayload {
        try {
            let secret: string;

            switch (type) {
                case TokenTypeEnum.ACCESS:
                    secret = configs.JWT_ACCESS_SECRET;
                    break;

                case TokenTypeEnum.REFRESH:
                    secret = configs.JWT_REFRESH_SECRET;
                    break;
            }
            return jwt.verify(token, secret) as ITokenPayload;
        } catch (e) {
            console.error(e.message);
            throw new ApiError("Invalid token", 401);
        }
    }

    public generateManagerActionToken(
        payload: IManagerActionTokenPayload,
        expiresIn: SignOptions["expiresIn"] = "30m"
    ): string {
        return jwt.sign(payload, configs.JWT_ACCESS_SECRET, {
            expiresIn,
        });
    }

    public verifyManagerActionToken(token: string): IManagerActionTokenPayload {
        try {
            return jwt.verify(token, configs.JWT_ACCESS_SECRET) as IManagerActionTokenPayload;
        } catch (e) {
            console.error(e.message);
            throw new ApiError("Invalid or expired action link", 401);
        }
    }
}

export const tokenService = new TokenServise();
