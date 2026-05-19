export interface IToken {
    _id?: string;
    accessToken: string;
    refreshToken: string;
    _userId: string;
}
export interface ITokenPayload {
    userId: string;
    role: string;
}

export interface IManagerActionTokenPayload {
    userId: string;
    action: "activation" | "recovery";
}

export interface ITokenPair {
    accessToken: string;
    refreshToken: string;
}
