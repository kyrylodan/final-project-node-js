import { ISignIn } from "../interfaces/auth.interface";
import { IUser } from "../interfaces/user.interface";
import { ITokenPair } from "../interfaces/token.interface";
import { configs } from "../configs/config";
import { ApiError } from "../errors/api.error";
import { userRepository } from "../repositories/user.repositories";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";
import { tokenRepository } from "../repositories/token.repositories";

const getNormalizedAdminEmails = () =>
    [configs.ADMIN_EMAIL, "admin@gmail.com"]
        .filter(Boolean)
        .map((email) => String(email).toLowerCase());

class AuthService {
    private getNormalizedRole(user: IUser) {
        const normalizedAdminEmails = getNormalizedAdminEmails();

        if (user.role === "admin" || user.role === "manager") {
            return user.role;
        }

        return normalizedAdminEmails.includes(user.email.toLowerCase()) ? "admin" : "manager";
    }

    private async validateManagerActionToken(token: string) {
        const tokenPayload = tokenService.verifyManagerActionToken(token);
        const user = await userRepository.getById(tokenPayload.userId);

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        if (!user.actionToken || user.actionToken !== token) {
            throw new ApiError("Action link is invalid or already used", 400);
        }

        if (!user.actionTokenType || user.actionTokenType !== tokenPayload.action) {
            throw new ApiError("Action link is invalid", 400);
        }

        const expiresAt = user.actionTokenExpiresAt ? new Date(user.actionTokenExpiresAt) : null;

        if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
            throw new ApiError("Action link expired", 400);
        }

        return { user, tokenPayload };
    }

    public async SignIn(dto: ISignIn): Promise<{ user: IUser; token: ITokenPair }> {
        const user = await userRepository.getByEmail(dto.email);

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        const normalizedRole = this.getNormalizedRole(user);

        if (user.isBanned) {
            throw new ApiError("User is banned", 403);
        }

        if (normalizedRole === "manager" && !user.isActive) {
            throw new ApiError("User is not activated", 403);
        }

        const passwordIsCorrect = await passwordService.comparePassword(dto.password, user.password);

        if (!passwordIsCorrect) {
            throw new ApiError("Incorrect password", 401);
        }

        const token = await tokenService.generateTokens({ userId: user._id, role: normalizedRole });

        await tokenRepository.create({ ...token, _userId: user._id as string });
        await userRepository.updateById(user._id as string, { last_login: new Date() });

        const userDocument = user as IUser & { toObject?: () => IUser };
        const userResponse = userDocument.toObject ? userDocument.toObject() : userDocument;
        userResponse.role = normalizedRole;
        userResponse.last_login = new Date();
        delete userResponse.password;

        return { user: userResponse, token };
    }

    public async getManagerActionInfo(token: string) {
        const { user, tokenPayload } = await this.validateManagerActionToken(token);

        return {
            email: user.email,
            name: user.name,
            surname: user.surname,
            action: tokenPayload.action,
        };
    }

    public async completeManagerAction(token: string, password: string) {
        const normalizedPassword = String(password || "").trim();

        if (normalizedPassword.length < 4) {
            throw new ApiError("Password must contain at least 4 characters", 400);
        }

        const { user, tokenPayload } = await this.validateManagerActionToken(token);
        const hashedPassword = await passwordService.hashPassword(normalizedPassword);

        await userRepository.updateById(user._id as string, {
            password: hashedPassword,
            isActive: true,
            actionToken: null,
            actionTokenType: null,
            actionTokenExpiresAt: null,
        });

        return {
            message:
                tokenPayload.action === "activation"
                    ? "Account activated successfully"
                    : "Password updated successfully",
        };
    }
}

export const authService = new AuthService();
