export interface IUser {
    _id?: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    isActive?: boolean;
    isBanned?: boolean;
    last_login?: string | null;
    actionTokenType?: "activation" | "recovery" | null;
    actionTokenExpiresAt?: string | null;
    phone?: string;
    age?: number;
    course?: string;
    course_format?: string;
    course_type?: string;
    status?: string | null;
    sum?: number | null;
    alreadyPaid?: number | null;
    created_at?: string;
}

export interface IUserMutationResponse {
    message: string;
    data: IUser;
}
